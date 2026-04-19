
const express=require("express")
const Lead=require("../model/lead")
const { getAllLocations } = require("../service/location");
const { getAllLeads } = require("../service/lead");
const { bathroomHelper, apartmentTypeHelper, limitHelper, listingStatusHelper, pageHelper, leadTypeHelper, leadStatusHelper, propertyTypeHelper, propertyStatusHelper, propertyStageHelper, propertyAreaHelper, yearOfConstructionHelper, paymentStatusHelper, amountHelper, timeHelper } = require("../utils/data.js")
const ExcelJS = require("exceljs");
const { getAllAgents } = require("../service/user");
const leadController = require("../controller/lead");

const router = express.Router();



router.get("/edit-lead", leadController.getEditLeadBasic)

router.post("/", leadController.createQuery);

router.get("/closed-leads", leadController.getLeadsByStatus("closed"));

router.get("/open-leads", leadController.getLeadsByStatus("open"));

router.get("/lost-leads", leadController.getLeadsByStatus("lost"));

// for editing
router.get("/edit-lead", leadController.getEditLeadFull);

router.post("/lead", leadController.createLead);

router.get("/customer-data/download-excel", leadController.downloadCustomerExcel);

router.get("/customer-data", leadController.getCustomerData);


router.get("/:id", leadController.getLeadById);

router.put("/:id", leadController.updateLead);


// POST: Create a new lead
// router.post("/", async (req, res) => {
//   try {
//     const lead = await Lead.create(req.body); // req.body must match schema
//     res.status(201).json({
//       success: true,
//       message: "Lead created successfully",
//       data: lead
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       message: "Error creating lead",
//       error: err.message
//     });
//   }
// });

// // GET: Fetch all leads
// router.get("/", async (req, res) => {
//   try {
//     const leads = await Lead.find().populate("assigned");
//     res.status(200).json({
//       success: true,
//       message: "Leads fetched successfully",
//       data: leads
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Error fetching leads",
//       error: err.message
//     });
//   }
// });


// // GET: Fetch single lead by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const lead = await Lead.findById(req.params.id);
//     if (!lead) {
//       return res.status(404).json({ success: false, message: "Lead not found" });
//     }
//     res.status(200).json({
//       success: true,
//       data: lead
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Error fetching lead",
//       error: err.message
//     });
//   }
// });

module.exports = router;
