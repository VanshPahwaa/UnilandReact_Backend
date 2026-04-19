const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");
const { Amenity } = require("../model/propertyAttributeModels.js");
const { getAllAmenities } = require("../service/amenities");
const { pageHelper, limitHelper } = require("../utils/data");

const updateAmenity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Amenity.findByIdAndUpdate(id, req.body);
  res.status(200).json({ success: true, message: "Success: Amenity Updated Successfully" });
});

const createAmenity = asyncHandler(async (req, res) => {
  const result = await Amenity.create({ name: req.body.name });
  if (!result) throw new AppError("Amenity is not able to upload", 400);
  res.status(200).json({ success: true, message: "Amenity Uploaded Successfully" });
});

const listAmenities = asyncHandler(async (req, res) => {
  const page = req.query.page || pageHelper;
  const limit = req.query.limit || limitHelper;
  let filter = req.query.filter || {};
  if (req.query.search) filter = { ...filter, userName: { $regex: req.query.search, $options: "i" } };
  const amenity = await getAllAmenities(filter, { page, limit });
  res.json({ success: true, message: "Amenity fetched successfully", data: { amenity: amenity.results, pagination: amenity.pagination, currentUrl: req.originalUrl.split("?")[0], limit: limitHelper, pageTitle: "Amenity" } });
});

const getAmenityById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const amenity = await getAllAmenities({ _id: id });
  if (!amenity || !amenity.results || amenity.results.length === 0) throw new AppError("Amenity not found", 404);
  res.json({ success: true, data: { amenity: amenity.results[0] } });
});

module.exports = { updateAmenity, createAmenity, listAmenities, getAmenityById };
