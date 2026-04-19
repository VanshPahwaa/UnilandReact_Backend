const asyncHandler = require("../middlewares/asyncHandler");
const Location = require("../model/location");
const AppError = require("../utils/AppError");
const { pageHelper, limitHelper } = require("../utils/data");

const updateLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Location.findByIdAndUpdate(id, req.body);
  res.status(200).json({ success: true, message: "Success: Updated SuccessFully" });
});

const createLocation = asyncHandler(async (req, res) => {
  const result = await Location.create({ locationName: req.body.locationName });
  if (!result) throw new AppError("Location are not able to upload", 400);
  res.status(200).json({ success: true, message: "Locations Uploaded Successfully" });
});

const listLocations = asyncHandler(async (req, res) => {
  const page = req.query.page || pageHelper;
  const limit = req.query.limit || limitHelper;
  let filter = req.query.filter || {};
  if (req.query.search) filter = { ...filter, locationName: { $regex: req.query.search, $options: "i" } };
  const locations = await Location.find(filter).skip((page - 1) * limit).limit(limit);
  res.json({ success: true, data: locations });
});

const getLocationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const location = await Location.findById(id);
  if (!location) throw new AppError("Location not found", 404);
  res.json({ success: true, data: location });
});

module.exports = { updateLocation, createLocation, listLocations, getLocationById };
