
const express=require("express")
const {  getAllLocations,getAllAmenities } = require("../helper/helperForModels.js");
const { bathroomHelper, apartmentTypeHelper, limitHelper, listingStatusHelper, pageHelper, leadTypeHelper, leadStatusHelper, propertyTypeHelper, propertyStatusHelper, propertyStageHelper, propertyAreaHelper, yearOfConstructionHelper, paymentStatusHelper, amountHelper, timeHelper } = require("../utils/data.js")
const router = express.Router();
const {Amenity}=require("../model/propertyAttributeModels.js")


router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.body);
    const result = await Amenity.findByIdAndUpdate(id, req.body);
    res.status(200).json({
      success: true,
      message: "Success: Amenity Updated Successfully",
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
    const { name } = req.body;
    console.log("request in amenity", req.body);
    const result = await Amenity.create({ name: req.body.name }); // in case any validation failed then control will directly go to catch block
    if (!result) {
      throw new Error("Amenity is not able to upload");
    }
    res.status(200).json({
      success: true,
      message: "Amenity Uploaded Successfully",
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
        userName: { $regex: req.query.search, $options: "i" },
      };
    }

    const amenity = await getAllAmenities(filter, { page: page, limit: limit });

    res.status(200).json({
      success: true,
      message: "Amenity fetched successfully",
      data: {
        amenity: amenity.results,
        pagination: amenity.pagination,
        currentUrl: req.originalUrl.split("?")[0],
        limit: limitHelper,
        pageTitle: "Amenity",
      },
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Failed: Internal Server Error",
      error: error.message,
    });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const amenity = await getAllAmenities({ _id: id });

    res.json({
      success: true,
      data: {
        amenity: amenity.results[0],
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