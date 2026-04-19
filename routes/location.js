const express = require("express");
const { updateLocation, createLocation, listLocations, getLocationById } = require("../controller/location");
const router = express.Router();

router.put("/:id", updateLocation);
router.post("/", createLocation);
router.get("/", listLocations);
router.get("/:id", getLocationById);

module.exports = router;