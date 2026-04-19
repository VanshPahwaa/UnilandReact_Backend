const Property = require("../model/property")
const User = require("../model/user")
const getAllPropertyHelper = require("../service/property");
const { pageHelper, limitHelper } = require("../utils/data");
const { generatePresignedPostConfig, moveTempToPermanent, deleteS3Object } = require("../service/s3Service");
const AppError = require("../utils/AppError");

/**
 * Generates S3 pre-signed POST config for property images.
 */
const getUploadConfig = async (req, res) => {
  try {
    const { fileType, fileName } = req.query;
    if (!fileType || !fileType.startsWith("image/")) {
      return res.status(400).json({ success: false, message: "Only image files are allowed" });
    }
    const config = await generatePresignedPostConfig(fileType, fileName || "property.png", "properties");
    res.status(200).json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// it will not work as imageUrl is only String tyype and it will return array of string 
// function findPaths(file){
//   let paths=null;
//   if(file){
//     if(Array.isArray(file){
//       paths=file.map((fileObj,index)=>fileObj.path)
//     }else{
//       paths=file.path
//     }
//   }
//   return paths
// }

const createProperty = async (req, res) => {
  try {
    const { imageKey, secondaryImageKeys, ...rest } = req.body;

    let uploadedBy = null;
    if (req.session && req.session.user) {
      uploadedBy = req.session.user.userId;
    }

    if (Array.isArray(rest.description)) {
      rest.description = rest.description.join('');
    }

    // 1. Create PENDING record
    const property = new Property({
      ...rest,
      imageUrl: imageKey,
      secondaryImageUrl: secondaryImageKeys || [],
      uploadedBy: uploadedBy,
      status: "PENDING"
    });

    await property.save();

    // 2. Move images if provided
    if (imageKey) {
      const permanentKey = await moveTempToPermanent(imageKey);
      property.imageUrl = permanentKey;
    }

    if (secondaryImageKeys && Array.isArray(secondaryImageKeys)) {
      const permanentKeys = await Promise.all(secondaryImageKeys.map(key => moveTempToPermanent(key)));
      property.secondaryImageUrl = permanentKeys;
    }

    // 3. Set to ACTIVE
    property.status = "ACTIVE";
    await property.save();

    res.status(201).json({
      message: "Success: Property uploaded successfully",
      success: true,
      data: property
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
}

function toArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

const editProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageKey, secondaryImageKeys, retainedExistingImage, imageUrl, secondaryImageUrl, ...rest } = req.body;

    let property = await Property.findById(id);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });

    // 1. Handle primary image update
    if (imageKey) {
      const permanentKey = await moveTempToPermanent(imageKey);
      if (property.imageUrl) await deleteS3Object(property.imageUrl);
      property.imageUrl = permanentKey;
    }


    // 2. Handle secondary images logic
    const retained = toArray(retainedExistingImage).map(img => {
      if (typeof img !== 'string') return img;
      // Strip bucket URL if present to keep only the key
      return img.replace(/^https:\/\/.*\.amazonaws\.com\//, "");
    });

    // a. Identify and delete removed images from S3
    for (let currentKey of (property.secondaryImageUrl || [])) {
      if (!retained.includes(currentKey)) {
        await deleteS3Object(currentKey);
      }
    }

    // b. Update secondary list with retained ones
    property.secondaryImageUrl = retained;

    // c. Add new S3 keys
    if (secondaryImageKeys && Array.isArray(secondaryImageKeys)) {
      const newPermanentKeys = await Promise.all(secondaryImageKeys.map(key => moveTempToPermanent(key)));
      property.secondaryImageUrl.push(...newPermanentKeys);
    }

    // 3. Update rest of the fields
    if (Array.isArray(rest.description)) {
      rest.description = rest.description.join('');
    }

    if (rest.additionalInformation && typeof rest.additionalInformation === "string") {
      rest.additionalInformation = JSON.parse(rest.additionalInformation);
    }
    if (rest.address && typeof rest.address === "string") {
      rest.address = JSON.parse(rest.address);
    }

    console.log("property", property);
    Object.assign(property, rest);
    console.log(await property.save());

    res.status(200).json({
      success: true,
      message: "Success: Property Updated successfully",
      data: property
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
}

const getProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    console.log("in get property")
    console.log(req.params)
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        error: "product not found",
        success: false
      })
    }
    const fileBuffer = fs.readFileSync(path.resolve(property.imageUrl))
    const base64File = fileBuffer.toString("base64");

    console.log(property)
    res.json({
      message: "Success: Property fetched successfully",
      data: property
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}


const getAllProperty = async (req, res) => {
  try {
    const property = await getAllPropertyHelper();

    res.json({
      success: true,
      message: "Success: Property fetched successfully",
      data: {
        property: property.results,
        pagination: property.pagination
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
}

const getFilteredProperty = async (req, res) => {
  try {

    let filter = {};

    // Helper to convert a param to array
    const toArray = (param) => {
      if (!param) return null;
      return Array.isArray(param) ? param : [param];
    }

    // Location (string or array)
    if (req.query.location) {
      const locations = toArray(req.query.location);
      filter.location = locations.length === 1 ? locations[0] : { $in: locations };
    }

    // Property Type
    if (req.query.propertyType) {
      const types = toArray(req.query.propertyType);
      filter.propertyType = { $in: types };
    }

    // Property Stage
    if (req.query.propertyStage) {
      const stages = toArray(req.query.propertyStage);
      filter.propertyStage = { $in: stages };
    }

    // Property Status
    if (req.query.propertyStatus) {
      const statuses = toArray(req.query.propertyStatus);
      filter.propertyStatus = { $in: statuses };
    }

    // Rooms
    if (req.query.rooms) {
      const rooms = toArray(req.query.rooms);
      filter['additionalInformation.rooms'] = { $in: rooms.map(Number) };
    }

    // Bathrooms
    if (req.query.bathrooms) {
      const baths = toArray(req.query.bathrooms);
      filter['additionalInformation.bathrooms'] = { $in: baths.map(Number) };
    }

    if (req.query.priceFrom) {
      filter.priceFrom = { $gte: Number(req.query.priceFrom) };
    }
    // Price
    if (req.query.priceTo) {
      filter.priceTo = { $lte: Number(req.query.priceTo) };
    }
    // Area ranges (can handle multiple ranges if needed)
    console.log(req.query.area)
    if (req.query.area) {
      console.log("in area")
      const areas = toArray(req.query.area);
      // ["0-1000", "1001-3000", ...]
      if (areas.length == 1) {
        const [from, to] = areas[0].split("-");
        console.log(to)
        if (to == "8000+") {
          filter.areaFrom = { $gte: Number(from) };
          filter.areaTo = { $gte: Number(from) };
        } else {
          console.log("in 8000")
          filter.areaFrom = { $gte: Number(from), $lte: Number(to) };
          filter.areaTo = { $gte: Number(from), $lte: Number(to) };
        }
      } else if (areas.length > 1) {
        // Match if any range overlaps
        filter.$or = areas.map(range => {
          const [from, to] = range.split("-");
          console.log(to == 8000)
          if (to == "8000+") {
            return {
              areaFrom: { $gte: Number(from) },
              areaTo: { $gte: Number(from) }
            };
          } else {
            return {
              areaFrom: { $gte: Number(from), $lte: Number(to) },
              areaTo: { $gte: Number(from), $lte: Number(to) }
            };
          }
        });
      }
    }

    let page = req.query.page || pageHelper;
    let limit = req.query.limit || limitHelper;
    console.log("filter", filter)

    const property = await getAllPropertyHelper(filter, { page: page, limit: limit })
    console.log(property)

    res.json({
      success: true,
      message: "property fetched successfully",
      data: {
        property: property.results,
        pageTitle: "Filter",
        pagination: property.pagination
        // queryString: new URLSearchParams(rest).toString()
      }
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
}

module.exports = { createProperty, getProperty, getAllProperty, getFilteredProperty, editProperty, getUploadConfig }
