
const express=require("express")
const Lead=require("../model/lead")
const {  getAllLocations,getAllLeads } = require("../helper/helperForModels.js");
const { bathroomHelper, apartmentTypeHelper, limitHelper, listingStatusHelper, pageHelper, leadTypeHelper, leadStatusHelper, propertyTypeHelper, propertyStatusHelper, propertyStageHelper, propertyAreaHelper, yearOfConstructionHelper, paymentStatusHelper, amountHelper, timeHelper } = require("../utils/data.js")
const ExcelJS = require("exceljs");
const getAllAgents = require("../helper/agent.js");

const router = express.Router();



router.get("/edit-lead", async (req, res) => {
    try {
      
      const location = await getAllLocations();
      const agent=await getAllAgents();
      let data={
        location: location.results,
        leadType: leadTypeHelper,
        leadStatus: leadStatusHelper
      }
          if(req?.session?.user?.role=='admin'){
            data={...data,agent:agent.results}
          }

        
        res.status(200).json({
            success: true,
            message: "Edit Data fetched successfully",
            data: data
        });
    }
    catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})

router.post("/", async (req, res) => {
    try {
        const { clientName, location, email, mobileNumber, leadType,propertyInterested } = req.body;
        let allowedEntries = { clientName, location: location, email, mobileNumber, leadType };
        if(propertyInterested){
            allowedEntries={...allowedEntries,propertyInterested}
        }
        const lead = await Lead.create(allowedEntries); // req.body must match schema
        res.status(201).json({
            success: true,
            message: "Query Recieved successfully"
        });
    } catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: "Error: Creating Lead",
            error: err.message
        });
    }
});

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


router.get("/:id", async (req, res) => {
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

router.put("/:id", async (req, res) => {
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
