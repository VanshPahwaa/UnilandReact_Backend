const Property = require("../model/property.js")
const paginate=require("../utils/paginate")
const getAllPropertyHelper = async (filters = {}, option = {}, projection = null, populate =null)=>{
    return paginate(Property, filters, option, projection, populate);
}

module.exports=getAllPropertyHelper