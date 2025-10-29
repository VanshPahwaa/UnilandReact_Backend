const Property = require("../model/property")
const User = require("../model/user")
const fs = require("fs")
const path = require("path");
const getAllPropertyHelper = require("../helper/property");
const { pageHelper, limitHelper } = require("../utils/data");


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
    // const imageUrl=findPaths(req.files.imageUrl)
    const imageUrl = req.files.imageUrl ? req.files.imageUrl[0].path : null;
    const secondaryImageUrl = req.files.secondaryImageUrl ? req.files.secondaryImageUrl.map((file, index) => file.path) : []

    let uploadedBy = null
    console.log(req.session)
    if (req.session && req.session.user) {
      uploadedBy = req.session.user.userId
    }
    console.log(req.body)
    if (Array.isArray(req.body.description)) {
      req.body.description = req.body.description.join(''); // join without separator
    }
    const property = new Property({ ...req.body, imageUrl: imageUrl, secondaryImageUrl: secondaryImageUrl, uploadedBy: uploadedBy });

    const result = await property.save()

    console.log(result)
    res.status(201).json({
      message: "Success: Property uploaded successfully",
      success: true
    });
  } catch (err) {
    // if (err.name === "ValidationError") {
    //   // Extract readable messages
    //   let messages = {};
    //   for (let field in err.errors) {
    //     messages[field] = err.errors[field].message;
    //   }
    // return res.status(500).json({ success: false, message: err.message });
    // }
    console.log(err)
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
}

function toArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

const editProperty = async (req, res) => {
  try {
    console.log("in edit property")
    const { id } = req.params;

    console.log(req.files)
    // for updation of imageUrl field
    if (req.files.imageUrl) {
      const newPath = req.files.imageUrl[0].path
      const property = await Property.findById(id);
      const oldPath = path.join(process.cwd(), property.imageUrl)

      // for deleting the file
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath)
      }
      property.imageUrl = newPath
      await property.save()
    }

    if (Array.isArray(req.body.description)) {
      req.body.description = req.body.description.join(''); // join without separator
    }

    // dealing with secondary images
    let property = await Property.findById(id)
    let secondaryPath = ''
    req.body.retainedExistingImage = toArray(req.body.retainedExistingImage)

    if (req.body.retainedExistingImage.length != property.secondaryImageUrl.length) {
      for (let value of property.secondaryImageUrl) {
        console.log(value, req.body.retainedExistingImage)
        console.log("not equal length", req.body.retainedExistingImage.includes(value))
        if (!req.body.retainedExistingImage.includes(value)) {
          const oldPath = path.join(process.cwd(), value);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath)
            console.log("deleted")
          }
          let index = property.secondaryImageUrl.indexOf(value)
          property.secondaryImageUrl.splice(index, 1)
          console.log("new array", property.secondaryImageUrl)
        }
      }
    }

    // req.body.deletedExistingImages=toArray(req.body.deletedExistingImages)
    // if(req.body.deletedExistingImages.length>0){
    //   for(let value of req.body.deletedExistingImages){
    //     if(property.secondaryImageUrl.includes(value)){
    //       const oldPath=path.join(process.cwd(),value)
    //       if(fs.existsSync(oldPath)){
    //         fs.unlinkSync(oldPath)
    //         console.log("deleted")
    //       }
    //       let index=property.secondaryImageUrl.indexOf(value)
    //       property.secondaryImageUrl.splice(index,1);
    //     }
    //   }
    // }

    console.log("req.files.secondaryImageUrl:", req.files.secondaryImageUrl);

    let filesArray = req.files.secondaryImageUrl
      ? Array.isArray(req.files.secondaryImageUrl)
        ? req.files.secondaryImageUrl
        : [req.files.secondaryImageUrl]
      : [];
    console.log("filessArray", filesArray)
    if (filesArray.length > 0) {
      const secondaryPath = filesArray.map(f => f.path);
      property.secondaryImageUrl.push(...secondaryPath);
    }

    await property.save()
    if (req.body.additionalInformation) {
      req.body.additionalInformation = JSON.parse(req.body.additionalInformation);
    }
    if (req.body.address) {
      req.body.address = JSON.parse(req.body.address);
    }
    console.log({ ...req.body })
    let result = await Property.findByIdAndUpdate(id, { $set: req.body }, { new: true })
    res.status(201).json({
      success: true,
      message: "Success:Property Updated successfully",
      data: result
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({
      success: false,
      error: error.message
    });
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
      data: property,
      fileData: base64File,
      fileType: path.extname(property.imageUrl)
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

module.exports = { createProperty, getProperty, getAllProperty, getFilteredProperty, editProperty }