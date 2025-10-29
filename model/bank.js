const mongoose = require("mongoose");
const bankSchema = new mongoose.Schema({
    bankName: { type: String, required:true,unique: true, collation: { locale: 'en', strength: 2 }, trim:true},
    rateOfInterest:{type:Number, required:true},
    bankLogo: { type: String }
})

const Bank = mongoose.model("Bank", bankSchema)



module.exports=Bank;