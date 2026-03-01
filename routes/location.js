const express=require("express")
const {  getAllLocations } = require("../helper/helperForModels.js");
const { limitHelper, pageHelper} = require("../utils/data.js")
const Location=require("../model/location");
const router = express.Router();


router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.body);
    const result = await Location.findByIdAndUpdate(id, req.body);
    res.status(200).json({
      success: true,
      message: "Success: Updated SuccessFully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message || "Internal Server Error",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    console.log(req.body);
    const result = await Location.create({
      locationName: req.body.locationName,
    }); // in case any validation failed then control will directly go to catch block
    if (!result) {
      throw new Error("Location are not able to upload");
    }
    res.status(200).json({
      success: true,
      message: "Locations Uploaded Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message || "Internel Server Error",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const page = req.query.page || pageHelper;
    const limit = req.query.limit || limitHelper;
    let filter = req.query.filter || {};

    if (req.query.search) {
      filter = {
        ...filter,
        locationName: { $regex: req.query.search, $options: "i" },
      };
    }

    const location = await getAllLocations(
      filter,
      { page: page, limit: limit },
      {}
    );
    console.log(location);
    res.status(200).json({
      success: true,
      message: "Location fetched successfully",
      data: {
        location: location.results,
        pagination: location.pagination,
        currentUrl: req.originalUrl.split("?")[0],
        limit: limitHelper,
        pageTitle: "Location",
      },
    });
  } catch (error) {
    console.log(error);
    res.render("common/500.ejs", {
      success: false,
      message: "Failed: Internal Server Error",
      error: error.message,
    });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const location = await getAllLocations({ _id: id });

    res.json({
      success: true,
      data: {
        location: location.results[0],
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message || "Internel Server Error",
    });
  }
});

module.exports=router;