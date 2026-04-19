const Location = require("../model/location.js");
const paginate = require("../utils/paginate");

const getAllLocations = async (filters = {}, option = {}, projection = null, populate = null) => {
  return paginate(Location, filters, option, projection, populate);
};

module.exports = { getAllLocations };
