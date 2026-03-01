const mongoose = require("mongoose")
const express = require("express")
require("dotenv").config()
const propertyRouter=require("./property1");
const leadRouter=require("./lead");
const authRouter=require("./auth");
const userRouter=require("./user");
const locationRouter=require("./location");
const bankRouter=require("./bank");
const router = express.Router();
const appointmentRouter=require("./appointments");
const amenitiesRouter=require("./amenities");





router.use("/property",propertyRouter);
router.use("/lead",leadRouter);
router.use("/auth",authRouter);
router.use("/user",userRouter);
router.use("/location",locationRouter);
router.use("/bank",bankRouter);
router.use("/appointment",appointmentRouter);
router.use("/amenity",amenitiesRouter);
// router.use("/lead",)

module.exports = router