const Lead = require("../model/lead.js");
const paginate = require("../utils/paginate");

const getAllLeads = async (filters = {}, option = {}, projection = null, populate = null) => {
  return paginate(Lead, filters, option, projection, populate);
};

module.exports = { getAllLeads };
