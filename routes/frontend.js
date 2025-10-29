const express = require("express")
const router = express.Router()
require("dotenv").config()

const fs = require("fs")
const puppeteer = require("puppeteer");


const Property = require("../model/property.js")
const Lead = require("../model/lead.js")
const Appointment = require("../model/appointments.js")

const paginate = require("../utils/paginate.js")
const path = require("path")
const adminRouter = require("./frontend/admin.js")
const Location = require("../model/location.js")
const getAllAgents = require("../helper/agent.js")
const getAllLocation = require("../helper/location.js")
// const { getAllProperty } = require("../controller/property.js")
const getAllPropertyHelper = require("../helper/property.js")
const { limitHelper, pageHelper, leadTypeHelper, leadStatusHelper, propertyTypeHelper, propertyStatusHelper, propertyStageHelper, propertyAreaHelper, yearOfConstructionHelper, paymentStatusHelper,amountHelper, timeHelper } = require("../utils/data.js")
const { getAllLeads, getAllAmenities, getAllLocations, getAllAppointments, getAllBanks } = require("../helper/helperForModels.js");
const { isAdmin, isLoggedIn, isLoggedOut } = require("../middlewares/auth.js")



//WITHOUT LOGGEDIN

//GET
router.get("/", async (req, res) => {
    try {
        // const response = await fetch(
        //     process.env.CLIENT_URL + "property/"
        // )
        // if (!response.ok) {
        //     throw new Error("API error" + response.status)
        // }
        // const propertyData = await response.json()

        const property = await getAllPropertyHelper({ listingStatus: "Published" })// for property listing


        const location = await getAllLocation()// for leads

        res.render("index.ejs", {
            data: {
                property: property.results,
                location: location.results
            }
        })

    } catch (error) {
        res.status(500).render("index-13.ejs", {
            data: { property: [] },
            error: "Could not load properties"
        })
    }
})

router.get("/sell-leads", async (req, res) => {
    try {
        const location = await getAllLocation()
        res.render("sell-leads.ejs", {
            data: {
                location: location.results
            }
        })
    } catch (error) {
        res.status(500).render("common/500.ejs", {
            message: "Internal Server Error",
            error: error.message || "Could not load properties"
        })
    }
})

router.get("/book-an-agent/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const property = await getAllPropertyHelper({ _id: id })
        if (property.length == 0) {
            return res.render("common/404.ejs",{
                success:false,
                message:"Property not Valid"
            })
        }
        const location = await getAllLocation()
        

        res.render("book-an-agent.ejs", {
            data: {
                location: location.results,
                amount:amountHelper,
                time:timeHelper
            }
        })
    } catch (error) {
        res.status(500).render("common/500.ejs", {
            message: "Internal Server Error",
            error: error.message || "Could not load properties"
        })
    }
})

router.get("/paymentStatus/:transactionId", async (req, res) => {
    try {
        const { transactionId } = req.params;
        console.log("in payment status")
        const transactionDetail = await Appointment.find({ transactionId: transactionId });
        const location = await getAllLocation()
        console.log(transactionDetail)
        res.render("paymentStatus.ejs", {
            data: {
                location: location.results,
                transactionDetail: transactionDetail[0]
            }
        })
    } catch (error) {
        res.status(500).render("common/500.ejs", {
            message: "Internal Server Error",
            error: error.message || "Internal Server Error: From Payment Status"
        })
    }
})

router.get("/payment-failed", async (req, res) => {
    try {
        const location = await getAllLocation()
        res.render("failedPayment.ejs", {
            data: {
                location: location.results
            }
        })
    } catch (error) {
        res.status(500).render("common/500.ejs", {
            message: "Internal Server Error",
            error: error.message || "Could not load properties"
        })
    }
})

router.get("/stripe-payment", async (req, res) => {
    try {
        const location = await getAllLocation()
        res.render("stripe-payment.ejs", {
            data: {
                location: location.results
            }
        })
    } catch (error) {
        res.status(500).render("common/500.ejs", {
            message: "Internal Server Error",
            error: error.message || "Could not load properties"
        })
    }
})

router.get('/downloadPDF/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(`http://localhost:8080/property/brouchure/${id}`, { waitUntil: 'networkidle0' });


        const pdfBuffer = await page.pdf({ format: 'LEGAL', printBackground: true });

        await browser.close();

        // Force browser to download PDF


        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="report.pdf"',
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.log(error.message)
    }
})



// NAVBAR

router.get("/our-mission", async (req, res) => {
    try {
        const location = await getAllLocation()// for leads
        res.render("our-mission.ejs", {
            success: true,
            message: "Success: Page Returned",
            data: {
                location: location.results
            }
        })

    } catch (error) {
        res.status(500).render("common/500.ejs", {
            success: false,
            message: "Failed:Internal Server Error",
            error: "Could not load properties"
        })
    }
})
router.get("/our-testimonials", async (req, res) => {
    try {
        const location = await getAllLocation()// for leads
        res.render("testimonials.ejs", {
            success: true,
            message: "Success: Page Returned",
            data: {
                location: location.results
            }
        })

    } catch (error) {
        res.status(500).render("common/500.ejs", {
            success: false,
            message: "Failed:Internal Server Error",
            error: "Could not load properties"
        })
    }
})

router.get("/emi-calculator", async (req, res) => {
    try {
        const location = await getAllLocations()
        console.log(location)
        res.render("emi-calculator.ejs", {
            success: true,
            message: "Success:",
            data: {
                location: location.results
            }
        })

    } catch (error) {
        console.log(error)
        res.render("common/500.ejs", {
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
})








// PROPERTIES

router.get("/front-property/:id", async (req, res) => {
    try {
        console.log("in front-property")
        const { id } = req.params;
        const property = await getAllPropertyHelper({ _id: id }, {}, null, ["amenities", "location"])
        const location = await getAllLocations()
        const banks = await getAllBanks()
        console.log(banks)
        res.status(200).render("property-single-v2.ejs", {
            success: true,
            message: "Success: Product Fetched",
            data: {
                location: location.results,
                property: property.results[0],
                bank:banks.results
            }
        })
    } catch (error) {
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Product not Fetched",
            error: error.message || "Server Error"
        })
    }
})

router.get("/front-property/brouchure/:id", async (req, res) => {
    try {
        console.log("in front-property")
        const { id } = req.params;
        const property = await getAllPropertyHelper({ _id: id }, {}, null, ["amenities", "location"])
        const location = await getAllLocations()
        res.status(200).render("brouchure.ejs", {
            success: true,
            message: "Success: Product Fetched",
            data: {
                location: location.results,
                property: property.results[0]
            }
        })
    } catch (error) {
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Product not Fetched",
            error: error.message || "Server Error"
        })
    }
})



// ADMIN

router.use("/admin", isLoggedIn)


router.get("/admin", async (req, res) => {
    try {
        // Using the model directly
        // const propertyDetails = await Property.aggregate([
        //     { $group: { _id: '$propertyStatus', count: { $sum: 1 } } }
        // ]);

        const propertyDetails = await Property.aggregate([
            // Use $facet to run multiple pipelines
            {
                $facet: {
                    // Pipeline for grouped data
                    groupedData: [
                        { $group: { _id: '$propertyStatus', count: { $sum: 1 } } },
                    ],
                    // Pipeline for total count
                    totalCount: [
                        { $count: "total" }
                    ]
                }
            },

            // Reshape the output
            {
                $project: {
                    data: '$groupedData',
                    total: { $arrayElemAt: ['$totalCount.total', 0] }
                }
            }
        ]);




        const leadDetails = await Lead.aggregate([
            // Use $facet to run multiple pipelines
            {
                $facet: {
                    // Pipeline for grouped data
                    groupedData: [
                        { $group: { _id: '$leadStatus', count: { $sum: 1 } } },
                    ],
                    // Pipeline for total count
                    totalCount: [
                        { $count: "total" }
                    ]
                }
            },

            // Reshape the output
            {
                $project: {
                    data: '$groupedData',
                    total: { $arrayElemAt: ['$totalCount.total', 0] }
                }
            }
        ]);

        // console.log(results[0]);
        // Output: { data: [{ _id: 'IT', count: 15 }, { _id: 'HR', count: 8 }], total: 23 }
        console.log(propertyDetails[0], leadDetails[0])

        res.render("admin/dashboard.ejs", {
            data: {
                propertyDetails: propertyDetails[0],
                leadDetails: leadDetails[0]
            }
        })
    } catch (error) {
        console.log(error)
        res.render("common/500.ejs")
    }
})


//LEADS
router.get("/admin/leads", async (req, res) => {
    try {
        // const [lead] = await Promise.all([
        //     fetch(process.env.CLIENT_URL + "leads"),
        //     // fetch(process.env.CLIENT_URL + "backend/admin/agents")
        // ])
        // const leadData = await lead.json();
        // const agentData = await agents.json();

        let filter = {}
        if (req.session.user.role == "agent") {
            filter = { assigned: req.session.user.userId }
        }

        const closedLeads = await getAllLeads({ ...filter, leadStatus: "closed" })
        const openLeads = await getAllLeads({ ...filter, leadStatus: "open" })
        const lostLeads = await getAllLeads({ ...filter, leadStatus: "lost" })
        console.log(lostLeads)

        res.render("admin/dashboard-lead.ejs", {
            success: true,
            message: "Lead fetched successfully",
            data: {
                closedLead: closedLeads.pagination.total,
                openLead: openLeads.pagination.total,
                lostLead: lostLeads.pagination.total,
                currentUrl: req.originalUrl.split("?")[0]
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})

router.get("/admin/closed-leads", async (req, res) => {
    try {
        const page = req.query.page || pageHelper;
        const limit = req.query.limit || limitHelper;
        let filter = req.query.filter || {};
        let searchedValue={}

        filter = { leadStatus: "closed" }
        if (req.session.user.role == "agent") {
            filter = { ...filter, assigned: req.session.user.userId }
        }
        if (req.query.q) {
            filter = { ...filter, clientName: { $regex: req.query.q, $options: "i" } }
            searchedValue.q=req.query.q
        }

        console.log(page, limit, filter)
        const agents = await getAllAgents()
        const leads = await getAllLeads(filter, { page: page, limit: limit })

        res.render("admin/dashboard-open-leads.ejs", {
            success: true,
            message: "Lead fetched successfully",
            data: {
                lead: leads.results,
                agent: agents.results,
                pagination: leads.pagination,
                currentUrl: req.originalUrl.split("?")[0],
                searchedValue:searchedValue,
                limit: limitHelper,
                pageTitle: "Closed Leads"
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})

router.get("/admin/open-leads", async (req, res) => {
    try {
        // let {page,...rest}=req.query;
        const page = req.query.page || pageHelper;
        console.log(page)

        const limit = req.query.limit || limitHelper;
        let filter = req.query.filter || {};

        filter = { leadStatus: "open" }

        if (req.session.user.role == "agent") {
            filter = { ...filter, assigned: req.session.user.userId }
        }
        if (req.query.q) {
            console.log("inside if")
            filter = { ...filter, clientName: { $regex: req.query.q, $options: "i" } }
        }
 let searchedValue={}
        if(req.query.q){
            searchedValue.q=req.query.q
        }



        // console.log(page,limit,filter)
        const agents = await getAllAgents()
        const leads = await getAllLeads(filter, { page: page, limit: limit })

        console.log(leads.pagination)

        res.render("admin/dashboard-open-leads.ejs", {
            success: true,
            message: "Lead fetched successfully",
            data: {
                lead: leads.results,
                agent: agents.results,
                pagination: leads.pagination,
                currentUrl: req.originalUrl.split("?")[0],
                limit: limitHelper,
                searchedValue:searchedValue,
                pageTitle: "Open Leads",
                // queryString: new URLSearchParams(rest).toString()
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})
router.get("/admin/lost-leads", async (req, res) => {
    try {
        const page = req.query.page || pageHelper;
        const limit = req.query.limit || limitHelper;
        let filter = req.query.filter || {};

        filter = { leadStatus: "lost" }

        if (req.session.user.role == "agent") {
            filter = { ...filter, assigned: req.session.user.userId }
        }
        if (req.query.q) {
            filter = { ...filter, clientName: { $regex: req.query.q, $options: "i" } }
        }

         let searchedValue={}
        if(req.query.q){
            searchedValue.q=req.query.q
        }

        console.log(page, limit, filter)
        const agents = await getAllAgents()
        const leads = await getAllLeads(filter, { page: page, limit: limit })

        res.render("admin/dashboard-open-leads.ejs", {
            success: true,
            message: "Lead fetched successfully",
            data: {
                lead: leads.results,
                agent: agents.results,
                pagination: leads.pagination,
                currentUrl: req.originalUrl.split("?")[0],
                limit: limitHelper,
                searchedValue:searchedValue,
                pageTitle: "Lost Leads"
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})

router.get("/admin/edit-lead/:id", async (req, res) => {
    try {

        const { id } = req.params
        const agents = await getAllAgents()
        const leads = await getAllLeads({ _id: id })
        const location = await getAllLocation()

        res.render("admin/dashboard-edit-lead.ejs", {
            success: true,
            message: "Lead fetched successfully",
            data: {
                lead: leads.results[0],
                agent: agents.results,
                location: location.results,
                leadType: leadTypeHelper,
                leadStatus: leadStatusHelper
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})




//AMENITIES
router.get("/admin/amenities", async (req, res) => {
    try {

        const page = req.query.page || pageHelper;
        console.log(page)

        const limit = req.query.limit || limitHelper;
        let filter = req.query.filter || {};
        if (req.query.q) {
            filter = { ...filter, name: { $regex: req.query.q, $options: "i" } }
        }

         let searchedValue={}
        if(req.query.q){
            searchedValue.q=req.query.q
        }


        // console.log(page,limit,filter)
        const amenities = await getAllAmenities(filter, { page: page, limit: limit })
        console.log(amenities)

        res.render("admin/dashboard-amenities.ejs", {
            success: true,
            message: "Lead fetched successfully",
            data: {
                amenity: amenities.results,
                pagination: amenities.pagination,
                currentUrl: req.originalUrl.split("?")[0],
                limit: limitHelper,
                pageTitle: "Amenity",
                searchedValue:searchedValue
                // queryString: new URLSearchParams(rest).toString()
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})

router.get("/admin/edit-amenity/:id", async (req, res) => {
    try {

        const { id } = req.params


        // console.log(page,limit,filter)
        const amenities = await getAllAmenities({ _id: id })
        console.log(amenities)

        res.render("admin/dashboard-edit-amenity.ejs", {
            success: true,
            message: "Lead fetched successfully",
            data: {
                amenity: amenities.results[0],

                // queryString: new URLSearchParams(rest).toString()
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})

router.get("/admin/new-amenity", async (req, res) => {
    try {
        // Using the model directly
        res.render("admin/dashboard-new-amenity.ejs")

    } catch (error) {
        console.log(error)
        res.render("common/500.ejs", {
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
})


//LOCATIONS
router.get("/admin/locations", async (req, res) => {
    try {
        // let {page,...rest}=req.query;
        const page = req.query.page || pageHelper;

        const limit = req.query.limit || limitHelper;
        let filter = req.query.filter || {};
        if (req.query.q) {
            console.log("inside if")
            filter = { ...filter, locationName: { $regex: req.query.q, $options: "i" } }
        }

        console.log(filter)
        let searchedValue={}
        if(req.query.q){
            searchedValue.q=req.query.q
        }


        // console.log(page,limit,filter)
        const location = await getAllLocations(filter, { page: page, limit: limit })
        console.log(location)

        res.render("admin/dashboard-locations.ejs", {
            success: true,
            message: "Locations fetched successfully",
            data: {
                location: location.results,
                pagination: location.pagination,
                currentUrl: req.originalUrl.split("?")[0],
                limit: limitHelper,
                pageTitle: "Location",
                searchedValue:searchedValue
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})

router.get("/admin/new-location", async (req, res) => {
    try {
        // const [amenities] = await Promise.all([
        //     fetch(process.env.CLIENT_URL + "propertyAttribute/amenity")])
        // const amenitiesData = await amenities.json();

        // console.log(amenitiesData)
        // if (!amenitiesData.data || !amenitiesData.data.length) {
        //     throw new Error("Lead not found")
        // }

        res.render("admin/dashboard-new-location.ejs", {
            success: true,
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})

router.get("/admin/edit-location/:id", async (req, res) => {
    try {
        const { id } = req.params
        const location = await Location.findById(id)
        res.render("admin/dashboard-edit-location.ejs", {
            success: true,
            message: "fetched successfully",
            data: {
                location: location
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})


// APPOINTMENTS
router.get("/admin/appointments", async (req, res) => {
    try {
        // let {page,...rest}=req.query;
        const page = req.query.page || pageHelper;

        const limit = req.query.limit || limitHelper;
        let filter = req.query.filter || {};
        let searchedValue={}

        if (req.query.q) {
            filter = { ...filter, clientName: { $regex: req.query.q, $options: "i" } }
            searchedValue.q=req.query.q;
        }
        if(req.session.user.role=="agent"){
            filter={...filter,assigned:req.session.user.userId}
        }

        console.log(searchedValue)
        const appointment = await getAllAppointments(filter, { page: page, limit: limit }, {}, ["locationName", "assigned"])

        res.render("admin/dashboard-appointments.ejs", {
            success: true,
            message: "Appointments fetched successfully",
            data: {
                appointment: appointment.results,
                pagination: appointment.pagination,
                currentUrl: req.originalUrl.split("?")[0],
                searchedValue:searchedValue,
                limit: limitHelper,
                pageTitle: "Appointment",
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})


router.get("/admin/edit-appointment/:id", async (req, res) => {
    try {

        const { id } = req.params
        const agents = await getAllAgents()
        const appointment = await getAllAppointments({ _id: id }, {}, {}, [])
        const location = await getAllLocation()

        res.render("admin/dashboard-edit-appointment.ejs", {
            success: true,
            message: "Appointment fetched successfully",
            data: {
                appointment: appointment.results[0],
                location: location.results,
                agent: agents.results,
                time:timeHelper,
                paymentStatus: paymentStatusHelper
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            data: {
                message: "Failed: Internal Server Error",
                error: error.message
            }

        })
    }
})


// CUSTOMER DATA
router.get("/admin/customerData", async (req, res) => {
    try {
        // let {page,...rest}=req.query;
        const page = req.query.page || pageHelper;

        const limit = req.query.limit || limitHelper;

        let filter = req.query.filter || {};
        let searchedValue={}

        if (req.query.fromDate || req.query.toDate) {
            filter.createdAt = {};

            if (req.query.fromDate) {
                filter.createdAt.$gte = new Date(req.query.fromDate);
                searchedValue.fromDate=req.query.fromDate
            }
            if (req.query.toDate) {
                filter.createdAt.$lte = new Date(req.query.toDate);
                searchedValue.toDate=req.query.toDate
            }
        }


        console.log(filter)


        // console.log(page,limit,filter)
        const customer = await getAllLeads(filter, { page: page, limit: limit })

        console.log(customer)
        res.render("admin/dashboard-customerData.ejs", {
            success: true,
            message: "Customer Data fetched successfully",
            data: {
                customerData: customer.results,
                pagination: customer.pagination,
                currentUrl: req.originalUrl.split("?")[0],
                limit: limitHelper,
                searchedValue:searchedValue,
                pageTitle: "Customer",
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            data: {
                message: "Failed: Internal Server Error",
                error: error.message
            }
        })
    }
})

// BANKS
router.get("/admin/banks", async (req, res) => {
    try {
        // let {page,...rest}=req.query;
        const page = req.query.page || pageHelper;
        const limit = req.query.limit || limitHelper;
        let filter = req.query.filter || {};
        if (req.query.q) {
            filter = { ...filter, bankName: { $regex: req.query.q, $options: "i" } }
        }

        let searchedValue={}
        if(req.query.q){
            searchedValue.q=req.query.q
        }

        // console.log(page,limit,filter)
        const banks = await getAllBanks(filter, { page: page, limit: limit })
        if(banks.length>0){
            res.json({
                success: true,
                message: "Locations fetched successfully",
                data: {
                    bank: banks.results,
                    pagination: banks.pagination,
                    currentUrl: req.originalUrl.split("?")[0],
                    limit: limitHelper,
                    pageTitle: "Banks",
                    searchedValue:searchedValue
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})

router.get("/admin/new-banks", async (req, res) => {
    try {
        res.render("admin/dashboard-new-banks.ejs", {
            success: true,
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})

router.get("/admin/edit-bank/:id", async (req, res) => {
    try {
        // const [amenities] = await Promise.all([
        //     fetch(process.env.CLIENT_URL + "propertyAttribute/amenity")])
        // const amenitiesData = await amenities.json();

        // console.log(amenitiesData)
        // if (!amenitiesData.data || !amenitiesData.data.length) {
        //     throw new Error("Lead not found")
        // }
        const { id } = req.params;
        const bank = await getAllBanks({ _id: id })
        console.log(bank)

        res.render("admin/dashboard-edit-bank.ejs", {
            success: true,
            data: {
                bank: bank.results[0]
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            data: {
                message: "Failed: Internal Server Error",
                error: error.message
            }
        })
    }
})


//AGENT
router.get("/admin/agents", async (req, res) => {
    try {
        const page = req.query.page || pageHelper;
        const limit = req.query.limit || limitHelper;
        let filter = req.query.filter || {};
        if (req.query.q) {
            filter = { ...filter, userName: { $regex: req.query.q, $options: "i" } }
        }


        const agents = await getAllAgents(filter, { page: page, limit: limit })

         let searchedValue={}
        if(req.query.q){
            searchedValue.q=req.query.q
        }

        res.render("admin/dashboard-agent.ejs", {
            success: true,
            message: "Agent fetched successfully",
            data: {
                agent: agents.results,
                pagination: agents.pagination,
                currentUrl: req.originalUrl.split("?")[0],
                limit: limitHelper,
                searchedValue:searchedValue,
                pageTitle: "Agents",
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})

router.get("/admin/new-agent", async (req, res) => {
    try {
        const { results, pagination } = await getAllLocation()
        res.render("admin/dashboard-new-agent.ejs", {
            success: true,
            message: "Agent fetched successfully",
            data: {
                location: results
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})

router.get("/admin/edit-agent/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const agents = await getAllAgents({ _id: id })
        const location = await getAllLocation()
        console.log("agents", agents.results)
        res.render("admin/dashboard-edit-agent.ejs", {
            success: true,
            message: "Agent fetched successfully",
            data: {
                agent: agents.results[0],
                location: location.results
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})

//LOGIN
router.get("/login", isLoggedOut, async (req, res) => {
    try {
        const location = await getAllLocations()

        res.render("admin/login.ejs", {
            success: true,
            data: {
                location: location.results
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            data: {
                message: "Failed: Internal Server Error",
                error: error.message
            }
        })
    }
})


// PROPERTY

router.get("/admin/properties-list", async (req, res) => {
    try {
        const page = req.query.page || pageHelper;
        const limit = req.query.limit || limitHelper;
        let filter = req.query.filter || {};

        if (req.query.q) {
            filter = { ...filter, title: { $regex: req.query.q, $options: "i" } }
        }

        let searchedValue={}
        if(req.query.q){
            searchedValue.q=req.query.q
        }

        if (req.session.user.role == "agent") {
            filter = { uploadedBy: req.session.user.userId }
        } else {

        }
        const property = await getAllPropertyHelper(filter, { page: page, limit: limit });
        console.log("property", property)
        console.log("limit", limit)
        res.render("admin/dashboard-properties-listing.ejs", {
            success: true,
            message: "Lead fetched successfully",
            data: {
                property: property.results,
                pagination: property.pagination,
                currentUrl: req.originalUrl.split("?")[0],
                limit: limitHelper,
                pageTitle: "Property",
                searchedValue:searchedValue
                // queryString: new URLSearchParams(rest).toString()
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})

router.get("/admin/new-property", async (req, res) => {
    try {
        const location = await getAllLocation()
        const amenity = await getAllAmenities({}, { limit: 30 })
        console.log(amenity)
        res.render("admin/dashboard-submit-property.ejs", {
            success: true,
            message: "Success",
            data: {
                propertyType: propertyTypeHelper,
                propertyStatus: propertyStatusHelper,
                amenities: amenity.results,
                location: location.results,
                propertyStage: propertyStageHelper,
                yearOfConstruction: yearOfConstructionHelper

            }
        })
    } catch (error) {
        console.log(error)
        res.render("common/500.ejs", {
            success: false,
            data: {
                message: "Internal Server Error",
                error: error.message || "Internal Server Error"
            }
        })

    }
})


router.get("/admin/edit-property/:id", async (req, res) => {
    try {

        const { id } = req.params;
        const amenities = await getAllAmenities({}, { limit: 100 })
        const property = await getAllPropertyHelper({ _id: id });
        const location = await getAllLocations();


        res.status(200).render("admin/dashboard-edit-property.ejs", {
            success: true,
            message: "Success: Product Fetched",
            data: {
                property: property.results[0],
                propertyType: propertyTypeHelper,
                propertyStatus: propertyStatusHelper,
                amenities: amenities.results,
                propertyStage: propertyStageHelper,
                location: location.results,
                yearOfConstruction: yearOfConstructionHelper
            }
        })
    } catch (error) {
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Product not Fetched",
            error: error.message || "Server Error"
        })
    }
})



// Extras
router.get("/services", async (req, res) => {
    try {

        const location = await getAllLocation()
        res.status(200).render("our-services.ejs", {
            success: true,
            message: "Success: Product Fetched",
            data: {
                location: location.results
            }
        })
    } catch (error) {
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Product not Fetched",
            error: error.message || "Server Error"
        })
    }
})

router.get("/browse", async (req, res) => {
    try {

        const location = await getAllLocation()
        const amenity = await getAllAmenities()
        // console.log(location)
        res.render("filter.ejs", {
            success: true,
            message: "filters fetched successfully",
            data: {
                location: location.results,
                amenity: amenity.results,
                propertyStatus: propertyStatusHelper,
                propertyType: propertyTypeHelper,
                propertyStage: propertyStageHelper,
                propertyArea: propertyAreaHelper,
                pageTitle: "Filter",
                // queryString: new URLSearchParams(rest).toString()
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})


// compare
router.get("/compare", async (req, res) => {
    try {
        let filter = {}
        console.log(req.query.propertyId)
        filter = { ...filter, _id: req.query.propertyId }
        // if(!id){
        //     throw new Error("Not recieved Properties")
        // }
        console.log("2nd compare", filter)
        const property = await getAllPropertyHelper(filter, {}, null, ["location", "amenities", "additionalInformation.nearByPlace"]);
        const location = await getAllLocations();

        console.log(property)

        res.render("compare.ejs", {
            success: true,
            message: "properties fetched successfully",
            data: {
                property: property.results,
                pageTitle: "Property",
                location: location.results
                // queryString: new URLSearchParams(rest).toString()
            }
        });
    }
    catch (error) {
        console.log(error);
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})







// router.get("/admin/edit-agent/:id", async (req, res) => {
//     try {




//         const id = req.params;

//         const locations=await Location.find()

//         const agentData = await agents.json();

//         if (!agentData.data || !agentData.data.length) {
//             throw new Error("Agents Data not found")
//         }

//         res.render("admin/dashboard-agent.ejs", {
//             success: true,
//             message: "Agent fetched successfully",
//             data: {
//                 agent: agentData.data,
//                 location:locations
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



// PROPERTY

// router.get("/admin/properties-list", async (req, res) => {
//     try {
//         // const [property] = await Promise.all([
//         //     fetch(process.env.CLIENT_URL + "backend/property")
//         // ])

//         // const propertyData = await property.json();
//         const page = req.query.page || pageHelper;
//         const filter = req.query.filter || {};
//         const limit = req.query.limit || limitHelper;
//         const property = await getAllPropertyHelper({}, { page: page, limit: limit })
//         console.log(property)

//         // if (!propertyData.data || !propertyData.data.length) {
//         //     throw new Error("Agents Data not found")
//         // }

//         res.render("admin/dashboard-properties-listing.ejs", {
//             success: true,
//             message: "Agent fetched successfully",
//             data: {
//                 properties: property.results,
//                 pagination: property.pagination
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


//AMENITY
// router.get("/admin/amenities", async (req, res) => {
//     try {
//         // const [amenities] = await Promise.all([
//         //     fetch(process.env.CLIENT_URL + "propertyAttribute/amenity")])
//         // const amenitiesData = await amenities.json();

//         await getAllAmenities()
//         console.log(amenitiesData)
//         if (!amenitiesData.data || !amenitiesData.data.length) {
//             throw new Error("Lead not found")
//         }

//         res.render("admin/dashboard-amenities.ejs", {
//             success: true,
//             message: "Amenities fetched successfully",
//             data: {
//                 amenities: amenitiesData.data
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



// router.get("/search", async (req, res) => {
//     try {
//         const [propertyTypeRes, amenityRes, propertyStatusRes] = await Promise.all([
//             fetch(process.env.CLIENT_URL + "propertyAttribute/propertyType"),
//             fetch(process.env.CLIENT_URL + "propertyAttribute/amenity"),
//             fetch(process.env.CLIENT_URL + "propertyAttribute/propertyStatus"),
//         ]);

//         if (!propertyTypeRes.ok || !amenityRes.ok || !propertyStatusRes.ok) {
//             throw new Error("Data not Fetched Successfully");
//         }

//         const [propertyType, amenity, propertyStatus] = await Promise.all([
//             propertyTypeRes.json(),
//             amenityRes.json(),
//             propertyStatusRes.json(),
//         ]);

//         res.render("filter-property1.ejs", {
//             success: true,
//             message: "Success: Data fetched",
//             data: {
//                 amenity: amenity.data,
//                 propertyType: propertyType.data,
//                 propertyStatus: propertyStatus.data,
//                 properties: [] // initially empty
//             }
//         });
//     } catch (error) {
//         console.log(error);
//         res.render("filter-property1.ejs", {
//             success: false,
//             message: "Failed: Internal Server Error",
//             error: error.message
//         });
//     }
// });


// router.get("/filter", async (req, res) => {
//     try {
//         // console.log(propertyType, propertyStatus, bedrooms, bathrooms, area, amenities, maxPrice, minPrice)
//         const { propertyType, propertyStatus, bedrooms, bathrooms, area, amenities, maxPrice, minPrice } = req.query || {};
//         if (!propertyType && !propertyStatus && !bedrooms && !bathrooms && !area && !amenities && !maxPrice && !minPrice) {
//             console.log("filters not found")
//             return res.json({
//                 success: true,
//                 queried: false,
//                 message: "Please Select any filter",
//             })
//         }

//         // --- Filter properties from your DB ---
//         let query = {};
//         if (propertyType) {
//             query.propertyType = propertyType;
//         }
//         if (propertyStatus) query.propertyStatus = propertyStatus;
//         if (bedrooms) query.bedrooms = bedrooms;
//         if (bathrooms) query.bathrooms = bathrooms;
//         if (area) {
//             const [min, max] = area.split("-").map(Number);
//             query.area = { $gte: min, $lte: max }
//         }; // example filter

//         // if (amenities && amenities.length) query.amenity = { $in: amenities };

//         console.log(query)
//         const filteredProperties = await Property.find(query);

//         console.log("filtered products", filteredProperties)
//         res.json({
//             success: true,
//             queried: true,
//             message: "Product fetched successfully",
//             data: {
//                 properties: filteredProperties
//             }
//         })
//     } catch (error) {
//         console.log("Error Found",error);
//         res.json({
//             success: false,
//             message: "Failed: Internal Server Error",
//             error: error.message || "internal Server Error"
//         });
//     }
// });


module.exports = router