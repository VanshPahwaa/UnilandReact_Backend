const mongoose=require("mongoose")
const express=require("express")
const Lead=require("../../model/lead");
const User = require("../../model/user");

const router = express.Router();

// POST: Create a new lead
router.post("/", async (req, res) => {
  try {
    const lead = await Lead.create(req.body); // req.body must match schema
    res.status(201).json({
      success: true,
      message: "We have recieved your query",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error creating lead",
      error: err.message
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const {id}=req.params;
    let lead=await Lead.findById(id)
    if(lead.assigned==req.body.assigned){
      await lead.save()
    }else{
      if(lead.assigned){
        await User.findByIdAndUpdate({_id:lead.assigned},{$pull:{'agentSpecificDetails.leads':lead._id}})
      }
      await User.findByIdAndUpdate({_id:req.body.assigned},{$push:{'agentSpecificDetails.leads':lead._id}})
    //  const oldAgent= User.findById(lead.assigned);
    //  oldAgent.agentSpecificDetails.leads.filter(id=>id.toString()!==lead._id)
    }
    let leadResult=await Lead.findByIdAndUpdate(id, req.body)
    res.status(201).json({
      success: true,
      message: "Success: Updated Successfully",
    });
  } catch (err) {
    console.log(err)
    res.status(400).json({
      success: false,
      message: "Error creating lead",
      error: err.message
    });
  }
});


// GET: Fetch all leads
router.get("/", async (req, res) => {
  try {
    const leads = await Lead.find().populate("assigned");
    res.status(200).json({
      success: true,
      message: "Leads fetched successfully",
      data: leads
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching leads",
      error: err.message
    });
  }
});


// GET: Fetch single lead by ID
router.get("/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching lead",
      error: err.message
    });
  }
});

module.exports = router;
