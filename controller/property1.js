const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");
const { getAllPropertyHelper } = require("../service/property");
const { getAllAmenities } = require("../service/amenities");
const { getAllLocations } = require("../service/location");
const { pageHelper, limitHelper, apartmentTypeHelper, propertyAreaHelper, bathroomHelper, propertyTypeHelper, propertyStatusHelper, propertyStageHelper, listingStatusHelper, yearOfConstructionHelper } = require("../utils/data");

const listPublishedProperties = asyncHandler(async (req, res) => {
  const property = await getAllPropertyHelper({ listingStatus: "Published" }, {}, {}, ["location", "amenities"]);
  res.status(200).json({ success: true, message: "Property fetched successfully", data: { property: property.results, pagination: property.pagination, currentUrl: req.originalUrl.split("?")[0], limit: limitHelper, pageTitle: "Property" } });
});

const listMyProperties = asyncHandler(async (req, res) => {
  const page = req.query.page || pageHelper;
  const limit = req.query.limit || limitHelper;
  let filter = req.query.filter || {};
  if (req.query.search) filter = { ...filter, title: { $regex: req.query.search, $options: "i" } };
  if (req.session && req.session.user && req.session.user.role == "agent") filter = { uploadedBy: req.session.user.userId };
  const property = await getAllPropertyHelper(filter, { page, limit }, {}, ["location"]);
  res.status(200).json({ success: true, message: "Property fetched successfully", data: { property: property.results, pagination: property.pagination, currentUrl: req.originalUrl.split("?")[0], limit: limitHelper, pageTitle: "Property" } });
});

const filterProperties = asyncHandler(async (req, res) => {
  let filter = {};
  const toArray = (param) => { if (!param) return null; return Array.isArray(param) ? param : [param]; };
  if (req.query.location) {
    const locations = toArray(req.query.location);
    filter.location = locations.length === 1 ? locations[0] : { $in: locations };
  }
  if (req.query.propertyType) {
    const types = toArray(req.query.propertyType);
    filter.propertyType = { $in: types };
  }
  if (req.query.propertyStage) {
    const stages = toArray(req.query.propertyStage);
    filter.propertyStage = { $in: stages };
  }
  if (req.query.propertyStatus) {
    const statuses = toArray(req.query.propertyStatus);
    filter.propertyStatus = { $in: statuses };
  }
  if (req.query.rooms) {
    const rooms = toArray(req.query.rooms);
    filter['additionalInformation.rooms'] = { $in: rooms.map(Number) };
  }
  if (req.query.bathrooms) {
    const baths = toArray(req.query.bathrooms);
    filter['additionalInformation.bathrooms'] = { $in: baths.map(Number) };
  }
  if (req.query.priceFrom) filter.priceFrom = { $gte: Number(req.query.priceFrom) };
  if (req.query.priceTo) filter.priceTo = { $lte: Number(req.query.priceTo) };

  if (req.query.area) {
    const areas = toArray(req.query.area);
    if (areas.length === 1) {
      const [from, to] = areas[0].split("-");
      if (to === "8000+") {
        filter.$or = [
          { areaFrom: { $gte: Number(from) } },
          { areaTo: { $gte: Number(from) } },
        ];
      } else {
        filter.$or = [
          { areaFrom: { $gte: Number(from), $lte: Number(to) } },
          { areaTo: { $gte: Number(from), $lte: Number(to) } },
        ];
      }
    } else if (areas.length > 1) {
      let tempAreaFilter = areas.map((range) => {
        const [from, to] = range.split("-");
        if (to === "8000+") {
          return { areaFrom: { $gte: Number(from) }, areaTo: { $gte: Number(from) } };
        }
        return [
          { areaFrom: { $gte: Number(from), $lte: Number(to) } },
          { areaTo: { $gte: Number(from), $lte: Number(to) } },
        ];
      });
      tempAreaFilter = tempAreaFilter.flat();
      filter.$or = tempAreaFilter;
    }
  }

  const page = req.query.page || pageHelper;
  const limit = req.query.limit || limitHelper;
  const property = await getAllPropertyHelper(filter, { page, limit }, {}, ["amenities", "location"]);
  res.json({ success: true, message: "property fetched successfully", data: { property: property.results, pagination: property.pagination } });
});

const editPropertyInfo = asyncHandler(async (req, res) => {
  const amenities = await getAllAmenities({}, { limit: 100 });
  const location = await getAllLocations();
  res.status(200).json({ success: true, message: "Success: Edit Info Fetched", data: { propertyType: propertyTypeHelper, propertyStatus: propertyStatusHelper, rooms: apartmentTypeHelper, area: propertyAreaHelper, bathrooms: bathroomHelper, amenities: amenities.results, propertyStage: propertyStageHelper, location: location.results, listingStatus: listingStatusHelper, yearOfConstruction: yearOfConstructionHelper } });
});

const getPropertyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const property = await getAllPropertyHelper({ _id: id }, {}, {}, ["amenities", "location"]);
  if (!property || !property.results || property.results.length === 0) throw new AppError("Property not found", 404);
  res.status(200).json({ success: true, message: "Success: Properties Fetched", data: { property: property.results[0] } });
});

const compareProperties = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length == 0) throw new AppError("No Property Ids Provided", 400);
  const properties = await getAllPropertyHelper({ _id: { $in: ids } }, {}, {}, ["amenities", "location"]);
  res.json({ success: true, message: "properties successfully fetched", property: properties.results });
});

module.exports = { listPublishedProperties, listMyProperties, filterProperties, editPropertyInfo, getPropertyById, compareProperties };
