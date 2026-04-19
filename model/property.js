const mongoose = require("mongoose")
const path=require("path")
const fs=require("fs")

const amenitiesSchema = new mongoose.Schema({
  swimmingPool: { type: Boolean },
  security: { type: Boolean },
  park: { type: Boolean },
  marketAccess: { type: Boolean }
})

const floorSchema = new mongoose.Schema({
  floor: { type: Number },
  description: { type: String },
})

const additionalInformationSchema = new mongoose.Schema({
  rooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  nearByPlace: {
    type: [{
      placeName: String,
      distance: Number // it should be in km
    }]
  },
  otherInfo: { type: String }// can be any comment or additional information
})

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  propertyType: { type: String, required: true },
  propertyStatus: { type: String, required: true, enum: ["For Rent", "For Sale", "For Sale or Rent"] },// for rent,sale,both
  areaFrom: { type: Number, required: true }, // from 250 sq ft, to 300 sq ft
  areaTo: { type: Number, required: true },
  address: {
    type: {
      unit: Number,
      street: String,
      city: String,
      district: String,
      state: String,
      pincode: Number
    }, required: true
  },
  uploadedBy:{type:mongoose.Types.ObjectId,ref:"User"},
  yearOfConstruction: { type: Number, required: true },
  listingStatus: { type: String, required: true }, // is published or unpusblished
  amenities: { type: [mongoose.Types.ObjectId], ref: "Amenity", required: true, default: [] },
  imageUrl: { type: String },
  videoUrl:{type:String},
  secondaryImageUrl:{type:[String]},
  additionalInformation: { type: additionalInformationSchema, required: true },
  location: { type: mongoose.Types.ObjectId, ref: "Location", required: true },
  propertyStage: { type: String, required: true },

  // sale specific properties
  builderName: { type: String,required:true },
  pricePerSqFt: { type: Number },
  priceFrom: { type: Number },// from 5 lakh to 10 lakh
  priceTo: { type: Number },// from 5 lakh to 10 lakh
  priceFromInWords: { type: String },// from 5 lakh to 10 lakh
  priceToInWords: { type: String },// from 5 lakh to 10 lakh


  //rent specific properties
  rent: { type: Number },
  status: { type: String, enum: ["PENDING", "ACTIVE"], default: "PENDING" }
}, { 
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      const { getFullUrl } = require("../service/s3Service");
      if (ret.imageUrl) ret.imageUrl = getFullUrl(ret.imageUrl);
      if (ret.secondaryImageUrl && Array.isArray(ret.secondaryImageUrl)) {
        ret.secondaryImageUrl = ret.secondaryImageUrl.map(img => getFullUrl(img));
      }
      return ret;
    }
  },
  toObject: {
    transform: function (doc, ret) {
      const { getFullUrl } = require("../service/s3Service");
      if (ret.imageUrl) ret.imageUrl = getFullUrl(ret.imageUrl);
      if (ret.secondaryImageUrl && Array.isArray(ret.secondaryImageUrl)) {
        ret.secondaryImageUrl = ret.secondaryImageUrl.map(img => getFullUrl(img));
      }
      return ret;
    }
  }
})

// propertySchema.post('find', function (result) {
//   // const fileBuffer = fs.readFileSync(path.resolve(property.imageUrl))
//   // const base64File = fileBuffer.toString("base64");
//   result.title = "vansh"
//   console.log("result", result)
// })


// propertySchema.methods.toJSON = function () {
//   const obj = this.toObject();
//   try {
//     const fs = require("fs");
//     const path = require("path");
//     const fileBuffer = fs.readFileSync(path.resolve(obj.imageUrl));
//     obj.imageBase64 = fileBuffer.toString("base64");
//   } catch (err) {
//     obj.imageBase64 = null; // fallback if file missing
//   }

//   return obj;
// };

// propertySchema.virtual("imageBase64").get(function () {
//   try {
//     const imagePath = path.join(process.cwd(), this.imageUrl);
//     const imageBuffer = fs.readFileSync(imagePath);
//     return `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
//   } catch (err) {
//     console.error("Image read error:", err.message);
//     return null;
//   }
// });

// propertySchema.virtual("secondaryImageBase64").get(function () {
//   try {
//     console.log("hlo")
//     let secondaryImageBase64=this.secondaryImageUrl.map((url,index)=>{
//      const imagePath=path.join(process.cwd(),url);
//      const imageBuffer=fs.readFileSync(imagePath);
//      return `data:image/jpeg;base64,${imageBuffer.toString("base64")}`; 
//     })
//     return [...secondaryImageBase64]    
//   } catch (err) {
//     console.error("Image read error:", err.message);
//     return null;
//   }
// });


// propertySchema.set("toObject",{virtuals:true});
// propertySchema.set("toJSON",{virtuals:true});


const Property = mongoose.model("Property", propertySchema)

module.exports = Property;