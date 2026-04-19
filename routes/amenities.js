
const express=require("express")
const { bathroomHelper, apartmentTypeHelper, limitHelper, listingStatusHelper, pageHelper, leadTypeHelper, leadStatusHelper, propertyTypeHelper, propertyStatusHelper, propertyStageHelper, propertyAreaHelper, yearOfConstructionHelper, paymentStatusHelper, amountHelper, timeHelper } = require("../utils/data.js")
const router = express.Router();
const { updateAmenity, createAmenity, listAmenities, getAmenityById } = require("../controller/amenities");

router.put("/:id", updateAmenity);
router.post("/", createAmenity);
router.get("/", listAmenities);
router.get("/:id", getAmenityById);

module.exports=router