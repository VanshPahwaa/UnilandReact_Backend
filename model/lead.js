const mongoose = require("mongoose");
const {leadTypeHelper}=require("../utils/data.js")

const leadSchema = new mongoose.Schema({
    clientName: { type: String, required: true },
    mobileNumber: {
        type: Number, required: true,
        min: 1000000000,
        max: 9999999999
    },
    email: { type: String, required: true },
    message: { type: String },

    time: {
        type: new mongoose.Schema({
            hour: { type: Number, min: 1, max: 12, required: true },
            minute: { type: Number, min: 0, max: 59, required: true },
            meridiem: { type: String, enum: ["AM", "PM"], required: true }
        })
    },
    leadType: { type: String,required:true,enum:leadTypeHelper, default:"Buy"},
    leadStatus:{type:String,required:true,default:"open",enum:["lost","closed","open"]},
    location:{type:mongoose.Types.ObjectId,ref:"Location"},
    assigned:{type:mongoose.Types.ObjectId,default:null,ref:"User"},
    propertyInterested:{type:mongoose.Types.ObjectId, ref:"Property"},

},{
    timestamps:true
})

const Lead=mongoose.model("Lead",leadSchema)

module.exports=Lead;