const mongoose = require("mongoose")
const locationSchema = new mongoose.Schema({
    locationName: { type: String, trim: true, required:true } // to compare case insensitive as it must be true
})

// locationSchema.index(
//   { locationName: 1 },
//   { unique: true, collation: { locale: 'en', strength: 2 } }
// );

const Location = mongoose.model("Location", locationSchema,"locations")
// Location.collection.dropIndex();
module.exports = Location;