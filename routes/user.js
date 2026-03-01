
const express=require("express");
const router=express.Router();
const { bathroomHelper, apartmentTypeHelper, limitHelper, listingStatusHelper, pageHelper, leadTypeHelper, leadStatusHelper, propertyTypeHelper, propertyStatusHelper, propertyStageHelper, propertyAreaHelper, yearOfConstructionHelper, paymentStatusHelper, amountHelper, timeHelper } = require("../utils/data.js");
const getAllAgents = require("../helper/agent.js");
const {  getAllLocations,getAllLeads } = require("../helper/helperForModels.js");
const User=require("../model/user.js")


//AGENT
router.get("/agents", async (req, res) => {
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

    const agents = await getAllAgents(
      filter,
      { page: page, limit: limit },
      {},
      ["agentSpecificDetails.location"]
    );

    res.status(200).json({
      success: true,
      message: "Agent fetched successfully",
      data: {
        agent: agents.results,
        pagination: agents.pagination,
        currentUrl: req.originalUrl.split("?")[0],
        limit: limitHelper,
        pageTitle: "Agents",
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed: Internal Server Error",
      error: error.message,
    });
  }
});

router.post("/agent", async (req, res) => {
  try {
    const { userName, location, password, email, mobileNumber } = req.body;
    const allowedEntries = {
      userName,
      "agentSpecificDetails.location": location,
      password,
      email,
      mobileNumber,
    };
    console.log(allowedEntries);
    const agent = await User.create(allowedEntries); // req.body must match schema
    res.status(201).json({
      success: true,
      message: "Agent created successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Error creating Agent",
      error: err.message,
    });
  }
});

// for updation
router.put("/agent/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, location, password, email, mobileNumber } = req.body;
    const allowedEntries = {
      userName,
      location,
      password,
      email,
      mobileNumber,
    };
    const agent = await User.findByIdAndUpdate(id, allowedEntries); // req.body must match schema
    res.status(201).json({
      success: true,
      message: "Agent Updated successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error while updating agent",
      error: err.message,
    });
  }
});

// for data needed for edit-agent
router.get("/edit-agent", async (req, res) => {
  try {
    const location = await getAllLocations();

    res.json({
      success: true,
      message: "Location fetched successfully",
      data: {
        location: location.results,
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

router.get("/agent/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await getAllAgents({ _id: id });

    console.log(agent.results[0]);
    res.json({
      success: true,
      data: {
        agent: agent.results[0],
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

module.exports=router