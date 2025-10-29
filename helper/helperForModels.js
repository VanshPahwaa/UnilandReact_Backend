const Lead = require("../model/lead.js")
const {Amenity}=require("../model/propertyAttributeModels.js");
const Location=require("../model/location.js")
const Appointment=require("../model/appointments.js")

const paginate=require("../utils/paginate");
const Bank = require("../model/bank.js");

const getAllLeads = async (filters = {}, option = {}, projection = null, populate = null)=>{
    return paginate(Lead, filters, option, projection, populate);
}

const getAllAmenities = async (filters = {}, option = {}, projection = null, populate = null)=>{
    return paginate(Amenity, filters, option, projection, populate);
}

const getAllLocations = async (filters = {}, option = {}, projection = null, populate = null)=>{
    return paginate(Location, filters, option, projection, populate);
}

const getAllAppointments = async (filters = {}, option = {}, projection = null, populate = null)=>{
    return paginate(Appointment, filters, option, projection, populate);
}

const getAllBanks = async (filters = {}, option = {}, projection = null, populate = null)=>{
    return paginate(Bank, filters, option, projection, populate);
}

module.exports={getAllLeads,getAllAmenities,getAllLocations,getAllAppointments,getAllBanks}