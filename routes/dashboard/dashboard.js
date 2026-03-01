const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const { Amenity } = require("../../model/propertyAttributeModels.js");
const Location = require("../../model/location.js");
const User = require("../../model/user.js");
const Lead = require("../../model/lead.js");
const Property = require("../../model/property.js");
const Appointment = require("../../model/appointments.js");
const Bank = require("../../model/bank.js");
const ExcelJS = require("exceljs");

const {
  bathroomHelper,
  apartmentTypeHelper,
  limitHelper,
  listingStatusHelper,
  pageHelper,
  leadTypeHelper,
  leadStatusHelper,
  propertyTypeHelper,
  propertyStatusHelper,
  propertyStageHelper,
  propertyAreaHelper,
  yearOfConstructionHelper,
  paymentStatusHelper,
  amountHelper,
  timeHelper,
} = require("../../utils/data.js");
const { upload } = require("../../common/multerconfig");
const {
  getAllLeads,
  getAllAmenities,
  getAllLocations,
  getAllAppointments,
  getAllBanks,
} = require("../../helper/helperForModels.js");
const getAllPropertyHelper = require("../../helper/property.js");

//
const propertyRouter = require("../../routes/property.js");
const getAllAgents = require("../../helper/agent.js");
const {
  createProperty,
  editProperty,
} = require("../../controller/property.js");

// // routers
// const agentRouter=require("./agentForAdmin");
// const propertyAttributeRouter=require("../propertyAttributeRoutes")

// // POST: Create a new lead
// // router.post("/", async (req, res) => {
// //   try {
// //     const lead = await Lead.create(req.body); // req.body must match schema
// //     res.status(201).json({
// //       success: true,
// //       message: "Lead created successfully",
// //       data: lead
// //     });
// //   } catch (err) {
// //     res.status(400).json({
// //       success: false,
// //       message: "Error creating lead",
// //       error: err.message
// //     });
// //   }
// // });

// // GET: Fetch all Agent
// // router.get("/agents", async (req, res) => {
// //   try {
// //     const agents = await User.find({role:"agent"});
// //     console.(agents)
// //     res.status(200).json({
// //       success: true,
// //       message: "agent fetched successfully",
// //       data: agents
// //     });
// //   } catch (err) {
// //     res.status(500).json({
// //       success: false,
// //       message: "Error fetching leads",
// //       error: err.message
// //     });
// //   }
// // });

// router.patch("/lead/:id", async (req, res) => {
//   try {
//     const {id}=req.params
//     console.log(id);
//     const lead = await Lead.findByIdAndUpdate(id,req.body); // req.body must match schema
//     if(!lead){
//       return res.status(404).json({
//         success:false,
//         message:"Lead Not found"
//       })
//     }

//     res.status(201).json({
//       success: true,
//       message: "Lead created successfully",
//       data: lead
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       message: "Error: Not able to update",
//       error: err.message || "internal server error"
//     });
//   }
// });

// NEW APIS

// CUSTOMER DATA
// router.get("/customer-data", async (req, res) => {
//     try {
//         // let {page,...rest}=req.query;
//         const page = req.query.page || pageHelper;

//         const limit = req.query.limit || limitHelper;

//         let filter = req.query.filter || {};

//         if (req.query.fromDate || req.query.toDate) {
//             filter.createdAt = {};

//             if (req.query.fromDate) {
//                 filter.createdAt.$gte = new Date(req.query.fromDate);
//             }
//             if (req.query.toDate) {
//                 filter.createdAt.$lte = new Date(req.query.toDate);
//             }
//         }

//         console.log(filter)

//         // console.log(page,limit,filter)
//         const customer = await getAllLeads(filter, { page: page, limit: limit })

//         res.render("admin/dashboard-customerData.ejs", {
//             success: true,
//             message: "Customer Data fetched successfully",
//             data: {
//                 customerData: customer.results,
//                 pagination: customer.pagination,
//                 currentUrl: req.originalUrl.split("?")[0],
//                 limit: limitHelper,
//                 pageTitle: "Customer",
//             }
//         });
//     }
//     catch (error) {
//         console.log(error);
//         res.json({
//             success: false,
//            m
//         })
//     }
// })

// Customer Data
router.get("/customer-data/download-excel", async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Customer-Data");

  // Add header row
  worksheet.columns = [
    { header: "Name", key: "name", width: 20 },
    { header: "Mobile Number", key: "mobileNumber", width: 20 },
    { header: "Email", key: "email", width: 15 },
  ];

  let filter = {};
  if (req.query.fromDate) {
    filter = { ...filter, createdAt: { $gte: req.query.fromDate } };
  }
  if (req.query.toDate) {
    filter = { ...filter, createdAt: { $lte: req.query.toDate } };
  }

  const customerData = await Lead.find(filter).lean();
  customerData.forEach((app) => {
    worksheet.addRow({
      name: app.clientName,
      //   preferredDate: app.preferredDate.toISOString().split('T')[0],
      mobileNumber: app.mobileNumber,
      email: app.email,
    });
  });

  res.setHeader(
    "Content-Disposition",
    'attachment; filename="customerData.xlsx"'
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  await workbook.xlsx.write(res);
  res.end();
});

// PROPERTIES
// router.get("/my-property", async (req, res) => {
//   try {
//     const page = req.query.page || pageHelper;
//     const limit = req.query.limit || limitHelper;
//     let filter = req.query.filter || {};

//     if (req.query.search) {
//       filter = {
//         ...filter,
//         title: { $regex: req.query.search, $options: "i" },
//       };
//     }

//     if (req.session && req.session.user && req.session.user.role == "agent") {
//       filter = { uploadedBy: req.session.user.userId };
//     } else {
//     }
//     const property = await getAllPropertyHelper(
//       filter,
//       { page: page, limit: limit },
//       {},
//       ["location"]
//     );
//     console.log(property);

//     res.status(200).json({
//       success: true,
//       message: "Property fetched successfully",
//       data: {
//         property: property.results,
//         pagination: property.pagination,
//         // currentUrl: req.originalUrl.split("?")[0],
//         limit: limitHelper,
//         pageTitle: "Property",
//         // queryString: new URLSearchParams(rest).toString()
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed: Internal Server Error",
//       error: error.message,
//     });
//   }
// });

// router.get("/property/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const property = await getAllPropertyHelper({ _id: id });
//     console.log(property.results[0].amenities);

//     res.status(200).json({
//       success: true,
//       message: "Success: Properties Fetched",
//       data: {
//         property: property.results[0],
//       },
//     });
//   } catch (error) {
//     res.render("common/500.ejs", {
//       success: false,
//       message: "Failed: Product not Fetched",
//       error: error.message || "Server Error",
//     });
//   }
// });

// router.get("/edit-property", async (req, res) => {
//   try {
//     const amenities = await getAllAmenities({}, { limit: 100 });
//     const location = await getAllLocations();

//     res.status(200).json({
//       success: true,
//       message: "Success: Edit Info Fetched",
//       data: {
//         propertyType: propertyTypeHelper,
//         propertyStatus: propertyStatusHelper,
//         rooms: apartmentTypeHelper,
//         bathrooms: bathroomHelper,
//         amenities: amenities.results,
//         propertyStage: propertyStageHelper,
//         location: location.results,
//         listingStatus: listingStatusHelper,
//         yearOfConstruction: yearOfConstructionHelper,
//       },
//     });
//   } catch (error) {
//     res.render("common/500.ejs", {
//       success: false,
//       message: "Failed: Product not Fetched",
//       error: error.message || "Server Error",
//     });
//   }
// });

router.post(
  "/property",
  upload.fields([
    { name: "imageUrl", maxCount: 1 },
    { name: "secondaryImageUrl", maxCount: 10 },
  ]),
  createProperty
);

router.put(
  "/property/:id",
  upload.fields([
    { name: "imageUrl", maxCount: 1 },
    { name: "secondaryImageUrl", maxCount: 10 },
  ]),
  editProperty
);

// router.get("/filter",getFilteredProperty)
// .get("/:propertyId",getProperty)

// .get("/",getAllProperty)

//LEADS
// router.get("/leads", async (req, res) => {
//     try {
//         // const [lead] = await Promise.all([
//         //     fetch(process.env.CLIENT_URL + "leads"),
//         //     // fetch(process.env.CLIENT_URL + "backend/admin/agents")
//         // ])
//         // const leadData = await lead.json();
//         // const agentData = await agents.json();

//         let filter = {}
//         if (req.session.user.role == "agent") {
//             filter = { assigned: req.session.user.userId }
//         }

//         const closedLeads = await getAllLeads({ ...filter, leadStatus: "closed" })
//         const openLeads = await getAllLeads({ ...filter, leadStatus: "open" })
//         const lostLeads = await getAllLeads({ ...filter, leadStatus: "lost" })
//         console.log(lostLeads)

//         res.render("admin/dashboard-lead.ejs", {
//             success: true,
//             message: "Lead fetched successfully",
//             data: {
//                 closedLead: closedLeads.pagination.total,
//                 openLead: openLeads.pagination.total,
//                 lostLead: lostLeads.pagination.total,
//                 currentUrl: req.originalUrl.split("?")[0]
//             }
//         });
//     }
//     catch (error) {
//         console.log(error);
//         res.render("common/500.ejs", {
//             success: false,
//             message: "Failed: Internal Server Error",
//             error: error.message
//         })
//     }
// })

router.get("/closed-leads", async (req, res) => {
  try {
    const page = req.query.page || pageHelper;
    const limit = req.query.limit || limitHelper;
    let filter = req.query.filter || {};

    filter = { leadStatus: "closed" };
    if (req.session && req.session.user && req.session.user.role == "agent") {
      filter = { ...filter, assigned: req.session.user.userId };
    }
    if (req.query.search) {
      filter = {
        ...filter,
        clientName: { $regex: req.query.search, $options: "i" },
      };
    }

    const leads = await getAllLeads(filter, { page: page, limit: limit }, {}, [
      "assigned",
    ]);
    console.log(leads);

    res.status(200).json({
      success: true,
      message: "Lead fetched successfully",
      data: {
        lead: leads.results,
        pagination: leads.pagination,
        currentUrl: req.originalUrl.split("?")[0],
        limit: limitHelper,
        pageTitle: "Closed Leads",
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

router.get("/open-leads", async (req, res) => {
  try {
    // let {page,...rest}=req.query;
    const page = req.query.page || pageHelper;
    const limit = req.query.limit || limitHelper;
    let filter = req.query.filter || {};

    filter = { leadStatus: "open" };

    if (req.session && req.session.role && req.session.user.role == "agent") {
      filter = { ...filter, assigned: req.session.user.userId };
    }
    if (req.query.search) {
      filter = {
        ...filter,
        clientName: { $regex: req.query.search, $options: "i" },
      };
    }

    const leads = await getAllLeads(filter, { page: page, limit: limit }, {}, [
      "assigned",
    ]);
    console.log(leads);

    res.status(200).json({
      success: true,
      message: "Lead fetched successfully",
      data: {
        lead: leads.results,
        pagination: leads.pagination,
        currentUrl: req.originalUrl.split("?")[0],
        limit: limitHelper,
        pageTitle: "Open Leads",
        // queryString: new URLSearchParams(rest).toString()
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

router.get("/lost-leads", async (req, res) => {
  try {
    const page = req.query.page || pageHelper;
    const limit = req.query.limit || limitHelper;
    let filter = req.query.filter || {};

    filter = { leadStatus: "lost" };

    if (req.session && req.session.user && req.session.user.role == "agent") {
      filter = { ...filter, assigned: req.session.user.userId };
    }
    if (req.query.search) {
      filter = {
        ...filter,
        clientName: { $regex: req.query.search, $options: "i" },
      };
    }

    const leads = await getAllLeads(filter, { page: page, limit: limit }, {}, [
      "assigned",
    ]);

    res.status(200).json({
      success: true,
      message: "Lead fetched successfully",
      data: {
        lead: leads.results,
        pagination: leads.pagination,
        currentUrl: req.originalUrl.split("?")[0],
        limit: limitHelper,
        pageTitle: "Lost Leads",
      },
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({
      success: false,
      message: "Failed: Internal Server Error",
      error: error.message,
    });
  }
});

// for editing

router.get("/edit-lead", async (req, res) => {
  try {
    const agents = await getAllAgents();
    const location = await getAllLocations();

    res.status(200).json({
      success: true,
      message: "Edit Data fetched successfully",
      data: {
        agent: agents.results,
        location: location.results,
        leadType: leadTypeHelper,
        leadStatus: leadStatusHelper,
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

router.post("/lead", async (req, res) => {
  try {
    const { clientName, location, email, mobileNumber, assigned } = req.body;
    let allowedEntries = {
      clientName,
      location: location,
      email,
      mobileNumber,
    };
    // if(req.session.user.role=='admin'){
    //     allowedEntries={...allowedEntries,assigned}
    // }
    const lead = await Lead.create(allowedEntries); // req.body must match schema
    res.status(201).json({
      success: true,
      message: "Lead created successfully",
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

// customer data
router.get("/customer-data", async (req, res) => {
  try {
    // let {page,...rest}=req.query;
    const page = req.query.page || pageHelper;

    const limit = req.query.limit || limitHelper;

    let filter = req.query.filter || {};
    let searchedValue = {};

    if (req.query.fromDate || req.query.toDate) {
      filter.createdAt = {};

      if (req.query.fromDate) {
        filter.createdAt.$gte = new Date(req.query.fromDate);
      }
      if (req.query.toDate) {
        filter.createdAt.$lte = new Date(req.query.toDate);
      }
    }

    console.log(filter);

    // console.log(page,limit,filter)
    const customer = await getAllLeads(filter, { page: page, limit: limit });

    console.log(customer);
    res.status(200).json({
      success: true,
      message: "Customer Data fetched successfully",
      data: {
        customerData: customer.results,
        pagination: customer.pagination,
        currentUrl: req.originalUrl.split("?")[0],
        limit: limitHelper,
        pageTitle: "Customer",
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
router.get("/lead/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await getAllLeads({ _id: id });

    console.log(lead.results[0]);
    res.json({
      success: true,
      data: {
        lead: lead.results[0],
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

router.put("/lead/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { clientName, location, email, mobileNumber, assigned, leadStatus } =
      req.body;
    let allowedEntries = {
      clientName,
      location: location,
      email,
      mobileNumber,
      assigned,
      leadStatus,
    };
    if (req.session.user.role == "admin") {
      allowedEntries = { ...allowedEntries, assigned };
    }
    const lead = await Lead.findByIdAndUpdate(id, allowedEntries); // req.body must match schema
    res.status(201).json({
      success: true,
      message: "Lead updated successfully",
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



// //LOCATION
router.put("/location/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.body);
    const result = await Location.findByIdAndUpdate(id, req.body);
    res.status(200).json({
      success: true,
      message: "Success: Updated SuccessFully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message || "Internal Server Error",
    });
  }
});

router.post("/location/", async (req, res) => {
  try {
    console.log(req.body);
    const result = await Location.create({
      locationName: req.body.locationName,
    }); // in case any validation failed then control will directly go to catch block
    if (!result) {
      throw new Error("Location are not able to upload");
    }
    res.status(200).json({
      success: true,
      message: "Locations Uploaded Successfully",
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

router.get("/location", async (req, res) => {
  try {
    const page = req.query.page || pageHelper;
    const limit = req.query.limit || limitHelper;
    let filter = req.query.filter || {};

    if (req.query.search) {
      filter = {
        ...filter,
        locationName: { $regex: req.query.search, $options: "i" },
      };
    }

    const location = await getAllLocations(
      filter,
      { page: page, limit: limit },
      {}
    );
    console.log(location);
    res.status(200).json({
      success: true,
      message: "Location fetched successfully",
      data: {
        location: location.results,
        pagination: location.pagination,
        currentUrl: req.originalUrl.split("?")[0],
        limit: limitHelper,
        pageTitle: "Location",
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

router.get("/location/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const location = await getAllLocations({ _id: id });

    res.json({
      success: true,
      data: {
        location: location.results[0],
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

// AMENITY
router.put("/amenity/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.body);
    const result = await Amenity.findByIdAndUpdate(id, req.body);
    res.status(200).json({
      success: true,
      message: "Success: Amenity Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message || "Internal Server Error",
    });
  }
});
router.post("/amenity/", async (req, res) => {
  try {
    const { name } = req.body;
    console.log("request in amenity", req.body);
    const result = await Amenity.create({ name: req.body.name }); // in case any validation failed then control will directly go to catch block
    if (!result) {
      throw new Error("Amenity is not able to upload");
    }
    res.status(200).json({
      success: true,
      message: "Amenity Uploaded Successfully",
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
router.get("/amenity", async (req, res) => {
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

    const amenity = await getAllAmenities(filter, { page: page, limit: limit });

    res.status(200).json({
      success: true,
      message: "Amenity fetched successfully",
      data: {
        amenity: amenity.results,
        pagination: amenity.pagination,
        currentUrl: req.originalUrl.split("?")[0],
        limit: limitHelper,
        pageTitle: "Amenity",
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
router.get("/amenity/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const amenity = await getAllAmenities({ _id: id });

    res.json({
      success: true,
      data: {
        amenity: amenity.results[0],
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
router.get("/appointment", async (req, res) => {
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
      {},
      ["assigned"]
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

router.get("/appointment/:id", async (req, res) => {
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

router.put("/appointment/:id", async (req, res) => {
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

// BANK
router.post("/bank/", upload.single("bankLogo"), async (req, res) => {
  try {
    console.log(req.body);
    let path = "";
    if (req.file.path) {
      path = req.file.path;
    }
    console.log(req.file);
    const result = await Bank.create({ ...req.body, bankLogo: path }); // in case any validation failed then control will directly go to catch block
    console.log("result after creation", result);
    if (!result) {
      throw new Error("Bank are not able to upload");
    }
    res.status(200).json({
      success: true,
      message: "Bank Uploaded Successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Internal Server Error",
      error: error.message || "Internel Server Error",
    });
  }
});

router.put("/bank/:id", upload.single("bankLogo"), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (req.file) {
      console.log(req.file);
      const newImagePath = req.file.path;
      const bank = await Bank.findById(id);

      if (bank && bank.bankLogo) {
        const oldImagePath = path.join(process.cwd(), bank.bankLogo);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updates.bankLogo = newImagePath;
    }

    const updatedBank = await Bank.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedBank) {
      throw new Error("Bank are not able to upload");
    }
    res.status(200).json({
      success: true,
      message: "Bank Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message || "Internel Server Error",
    });
  }
});

router.get("/bank/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const bank = await getAllBanks({ _id: id });

    console.log(bank);
    res.json({
      success: true,
      data: {
        bank: bank.results[0],
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

router.get("/bank", async (req, res) => {
  try {
    const page = req.query.page || pageHelper;
    const limit = req.query.limit || limitHelper;
    let filter = req.query.filter || {};
    if (req.query.search) {
      filter = {
        ...filter,
        bankName: { $regex: req.query.search, $options: "i" },
      };
    }

    // console.log(page,limit,filter)
    const banks = await getAllBanks(filter, { page: page, limit: limit });

    console.log(banks);

    res.json({
      success: true,
      message: "Banks fetched successfully",
      data: {
        bank: banks.results,
        pagination: banks.pagination,
        currentUrl: req.originalUrl.split("?")[0],
        limit: limitHelper,
        pageTitle: "Banks",
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

router.delete("/bank/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const bank = await Bank.findById(id);
    if (!bank || bank.length == 0) {
      // if not bank exist or returnd bank is array and its length is zero
      return res.status(404).json({
        success: false,
        message: "Bank not Found",
      });
    }

    if (bank && bank.bankLogo) {
      const imagePath = path.join(process.cwd(), bank.bankLogo);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    await Bank.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Bank Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message || "Internel Server Error",
    });
  }
});

// router.use("/agent",agentRouter);
// router.use("/propertyAttribute",propertyAttributeRouter)

// GET: Fetch single lead by ID
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
