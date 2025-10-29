const mongoose = require("mongoose")

const agentSchema = new mongoose.Schema({
    leads:{ type: [mongoose.Types.ObjectId], ref: "Lead", default: [] },
    appointments:{ type: [mongoose.Types.ObjectId], ref: "Appointment", default: [] },
    location: { type: mongoose.Types.ObjectId, ref: "Location", required: true },
    propertyUploaded: { type: [mongoose.Types.ObjectId], ref: "Property", default: [] }
})

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, trim:true },
    password: {
        type: String, required: true, minlength: 8,
        match: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
    },
    email: {
        type: String, required: true, unique: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    mobileNumber:{type:Number, required:true,minlength:10,maxlength:10,match:/^[0-9]+$/},
    role: { type: String, default: "agent", enum: ["user", "admin", "agent"] },
    agentSpecificDetails: { type: agentSchema }
},
    { timestamps: true });

const User = mongoose.model("User", userSchema)

module.exports = User;