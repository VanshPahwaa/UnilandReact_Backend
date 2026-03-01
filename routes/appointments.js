const express=require("express")
const {  getAllAppointments } = require("../helper/helperForModels.js");
const Appointment=require("../model/appointments.js");
const getAllAgents = require("../helper/agent.js");

const {
  bathroomHelper,
  apartmentTypeHelper,
  limitHelper,
  pageHelper,
  timeHelper,
} = require("../utils/data.js");

const router = express.Router();


// // APPOINTMENT
// router.put("/appointment/:id", async (req, res) => {
//     try {
//         const { id } = req.params
//  let appointment=await Appointment.findById(id)
//     if(appointment.assigned==req.body.assigned){
//       await appointment.save()
//     }else{
//       if(appointment.assigned){
//         await User.findByIdAndUpdate({_id:appointment.assigned},{$pull:{'agentSpecificDetails.appointments':appointment._id}})
//       }
//       await User.findByIdAndUpdate({_id:req.body.assigned},{$push:{'agentSpecificDetails.appointments':appointment._id}})
//     //  const oldAgent= User.findById(lead.assigned);
//     //  oldAgent.agentSpecificDetails.leads.filter(id=>id.toString()!==lead._id)
//     }
//         console.log(req.body)
//         const result = await Appointment.findByIdAndUpdate(id,req.body);
//         res.status(200).json({
//             success: true,
//             message: "Success: Updated SuccessFully",
//         })
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             error: error.message || "Internal Server Error"
//         })

//     }
// })

// APPOINTMENTS
router.get("/", async (req, res) => {
  try {
    // let {page,...rest}=req.query;
    const page = req.query.page || pageHelper;

    const limit = req.query.limit || limitHelper;
    let filter = req.query.filter || {};

    if (req.query.search) {
      filter = {
        ...filter,
        clientName: { $regex: req.query.search, $options: "i" },
      };
    }
    if (req.session.user.role == "agent") {
      filter = { ...filter, assigned: req.session.user.userId };
    }

    const appointment = await getAllAppointments(
      filter,
      { page: page, limit: limit },
      {}
      ,["assigned"]
    );

    res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
      data: {
        appointment: appointment.results,
        pagination: appointment.pagination,
        currentUrl: req.originalUrl.split("?")[0],
        limit: limitHelper,
        pageTitle: "Appointment",
      },
    });
  } catch (error) {
    console.log(error);
    res.render("common/500.ejs", {
      success: false,
      message: "Failed: Internal Server Error",
      error: error.message,
    });
  }
});

router.get("/edit-appointment", async (req, res) => {
  try {
    const agents = await getAllAgents();
    res.status(200).json({
      success: true,
      data: {
        agent: agents.results,
        time: timeHelper,
      },
      message: "Appointment fetched successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      data: {
        message: "Failed: Internal Server Error",
        error: error.message,
      },
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await getAllAppointments({ _id: id });

    console.log(lead.results[0]);
    res.json({
      success: true,
      data: {
        appointment: lead.results[0],
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

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clientName,
      location,
      email,
      mobileNumber,
      assigned,
      preferredDate,
      preferredTime,
    } = req.body;
    let allowedEntries = {
      clientName,
      email,
      mobileNumber,
      preferredDate,
      preferredTime,
    };
    if (req.session.user.role == "admin") {
      allowedEntries = { ...allowedEntries, assigned };
    }
    console.log(allowedEntries);
    const lead = await Appointment.findByIdAndUpdate(id, allowedEntries); // req.body must match schema
    res.status(201).json({
      success: true,
      message: "Appointment updated successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Error: Creating Lead",
      error: err.message,
    });
  }
});




module.exports=router;