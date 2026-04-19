const { Amenity } = require("../model/propertyAttributeModels.js");
const paginate = require("../utils/paginate");

const getAllAmenities = async (filters = {}, option = {}, projection = null, populate = null) => {
  return paginate(Amenity, filters, option, projection, populate);
};

module.exports = { getAllAmenities };
