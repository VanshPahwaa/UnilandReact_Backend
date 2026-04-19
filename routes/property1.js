const mongoose = require("mongoose")
const express = require("express")
require("dotenv").config()

const router = express.Router();
const { bathroomHelper, apartmentTypeHelper, limitHelper, listingStatusHelper, pageHelper, leadTypeHelper, leadStatusHelper, propertyTypeHelper, propertyStatusHelper, propertyStageHelper, propertyAreaHelper, yearOfConstructionHelper, paymentStatusHelper, amountHelper, timeHelper } = require("../utils/data.js")
const { getAllAmenities } = require("../service/amenities");
const { getAllLocations } = require("../service/location");
const { getAllPropertyHelper } = require("../service/property");
const paymentRouter = require("./backend/paymentGateway.js");
const { default: puppeteer } = require("puppeteer");
const {
  createProperty,
  editProperty,
  getUploadConfig,
} = require("../controller/property.js");
const property1Controller = require("../controller/property1");

router.get("/upload-config", getUploadConfig);
router.get("/", property1Controller.listPublishedProperties);

router.get("/my-property", property1Controller.listMyProperties);

router.get("/filter-property", property1Controller.filterProperties);

router.get("/edit-property", property1Controller.editPropertyInfo);

router.get("/:id", property1Controller.getPropertyById);

router.post("/compare", property1Controller.compareProperties);

// auth
router.put("/:id", editProperty);

router.post("/property", createProperty);

// for dashboard users



module.exports=router
