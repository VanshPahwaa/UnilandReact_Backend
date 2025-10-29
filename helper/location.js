const Location = require("../model/location")
const paginate=require("../utils/paginate")
const getAllLocation = async (filters = {}, option = {}, projection = null, populate = null)=>{
    return paginate(Location, filters, option, projection, populate);
}

module.exports=getAllLocation