const mongoose = require("mongoose");
const { getFullUrl } = require("../service/s3Service");
const bankSchema = new mongoose.Schema({
    bankName: { type: String, required: true, unique: true, collation: { locale: 'en', strength: 2 }, trim: true },
    rateOfInterest: { type: Number, required: true },
    bankLogo: { type: String },
    status: { type: String, enum: ["PENDING", "ACTIVE"], default: "PENDING" }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.bankLogo = getFullUrl(ret.bankLogo);
            return ret;
        }
    },
    toObject: {
        transform: function (doc, ret) {
            ret.bankLogo = getFullUrl(ret.bankLogo);
            return ret;
        }
    }
});


const Bank = mongoose.model("Bank", bankSchema)



module.exports = Bank;