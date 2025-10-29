const mongoose = require("mongoose")
const amenitySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true, lowercase: true },
    icon: { type: String },
},{timestamps:true})

const propertyTypeSchema = new mongoose.Schema({
    category: { type: String, trim: true, unique: true, required: true }
})

const propertyStatusSchema = new mongoose.Schema({
    status: { type: String, trim: true, unique: true, required: true }
})
const Amenity = mongoose.model("Amenity", amenitySchema)
const PropertyType=mongoose.model("PropertyType",propertyTypeSchema)
const PropertyStatus=mongoose.model("PropertyStatus",propertyStatusSchema)

module.exports = {Amenity,PropertyType,PropertyStatus}