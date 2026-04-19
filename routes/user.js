
const express=require("express");
const router=express.Router();
const { bathroomHelper, apartmentTypeHelper, limitHelper, listingStatusHelper, pageHelper, leadTypeHelper, leadStatusHelper, propertyTypeHelper, propertyStatusHelper, propertyStageHelper, propertyAreaHelper, yearOfConstructionHelper, paymentStatusHelper, amountHelper, timeHelper } = require("../utils/data.js");
const { getAllLeads } = require("../service/lead");
const { listAgents, createAgent, updateAgent, getEditAgentData, getAgentById } = require("../controller/user");



//AGENT
router.get("/agents", listAgents);

router.post("/agent", createAgent);

// for updation
router.put("/agent/:id", updateAgent);

// for data needed for edit-agent
router.get("/edit-agent", getEditAgentData);

router.get("/agent/:id", getAgentById);

module.exports=router