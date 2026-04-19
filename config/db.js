const mongoose = require("mongoose");
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`
});
async function dbStart() {
  try {
    const mongodb = await mongoose.connect(process.env.DB_URL);
    //  const mongodb = await mongoose.connect(
    //   "mongodb://mongo:27017/uniland-react"
    // );

    console.log("Db Connected");
  } catch (error) {
    console.log(error.message, "error while connecting db");
    throw error; // Re-throw to prevent app from starting silently on failure
  }
}

module.exports = dbStart;
