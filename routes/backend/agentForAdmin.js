const mongoose = require("mongoose")
const express = require("express")
const User = require("../../model/user")

const router = express.Router();

// POST: Create a new Agent
router.post("/", async (req, res) => {
    try {
        console.log("req.body", req.body)
        const agent = await User.create(req.body); // req.body must match schema
        res.status(201).json({
            success: true,
            message: "Agent created successfully"
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Error creating Agent",
            error: err.message
        });
    }
});


// PUT: Create a new Agent
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const agent = await User.findByIdAndUpdate(id, req.body); // req.body must match schema
        res.status(201).json({
            success: true,
            message: "Agent updated successfully"
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Error creating Agent",
            error: err.message
        });
    }
});



// GET: Fetch all agents
router.get("/", async (req, res) => {
    try {
        const agent = await User.find({ role: "agent" });
        res.status(200).json({
            success: true,
            message: "agent fetched successfully",
            data: agent
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
        const { id } = req.params;
        const agent = await User.findById(id)
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
