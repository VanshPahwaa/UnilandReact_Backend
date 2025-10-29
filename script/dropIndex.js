const mongoose = require("mongoose");
const Location = require("../model/location"); // adjust path to your model
const dbStart = require("./common/db.js")

(async () => {
  try {
    await dbStart()
    // Drop the old index on locationName (case-sensitive one)
    await Location.collection.dropIndex("locationName_1");  
    console.log("Old index dropped successfully ✅");

    // Recreate with case-insensitive collation + unique
    await Location.collection.createIndex(
      { locationName: 1 },
      { unique: true, collation: { locale: "en", strength: 2 } }
    );
    console.log("New case-insensitive unique index created ✅");

    mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err.message);
  }
})();
