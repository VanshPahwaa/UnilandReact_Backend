const Bank = require("../model/bank.js");
const paginate = require("../utils/paginate");

const getAllBanks = async (filters = {}, option = {}, projection = null, populate = null) => {
  return paginate(Bank, filters, option, projection, populate);
};

module.exports = { getAllBanks };
