const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    clientName: { type: String, trim: true },
    mobileNumber: {
        type: Number,

    },
    email: { type: String, required: true },
    // locationName:{type:mongoose.Types.ObjectId,default:null,ref:"Location"},
    preferredDate: { type: Date, default: null },
    propertyInterested: { type: mongoose.Types.ObjectId, default: null, ref: "Property" },
    preferredTime: { type: String, required: true },
    paymentGateway: { type: String, required: true },

    assigned: { type: mongoose.Types.ObjectId, default: null, ref: "User" },
    status: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
    // amount: Number,
    paymentGatewayId: String,
    transactionId: String,
    // paidAt: Date,
    // IN FUTURE
    // agentInterested:{type:mongoose.Types.ObjectId, ref:"Property"}
    // mode: { type: String, required:true, enum: ["online", "offline"] },
    // purpose:{type:String,required:true,enum:["Tour","Query"]},
    // approved:{type:Boolean,required:true,default:false},

}, {
    timestamps: true
})

const Appointment = mongoose.model("Appointment", appointmentSchema)

module.exports = Appointment;