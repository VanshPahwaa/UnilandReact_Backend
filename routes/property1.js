const mongoose = require("mongoose")
const express = require("express")
require("dotenv").config()

const router = express.Router();
const { bathroomHelper, apartmentTypeHelper, limitHelper, listingStatusHelper, pageHelper, leadTypeHelper, leadStatusHelper, propertyTypeHelper, propertyStatusHelper, propertyStageHelper, propertyAreaHelper, yearOfConstructionHelper, paymentStatusHelper, amountHelper, timeHelper } = require("../utils/data.js")
const { getAllLeads, getAllAmenities, getAllLocations, getAllAppointments, getAllBanks } = require("../helper/helperForModels.js")
const getAllPropertyHelper = require("../helper/property.js")
const paymentRouter = require("./backend/paymentGateway.js");
const Property = require("../model/property.js");
const { default: puppeteer } = require("puppeteer");
const {
  createProperty,
  editProperty,
} = require("../controller/property.js");
const { upload } = require("../config/multerconfig.js");



router.get("/", async (req, res) => {
   try {
         
        const property = await getAllPropertyHelper({listingStatus:"Published"},{},{},["location","amenities"]);
        res.status(200).json({
            success: true,
            message: "Property fetched successfully",
            data: {
                property: property.results,
                pagination: property.pagination,
                currentUrl: req.originalUrl.split("?")[0],
                limit: limitHelper,
                pageTitle: "Property",
                // queryString: new URLSearchParams(rest).toString()
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})

router.get("/my-property", async (req, res) => {
  try {
    
    const page = req.query.page || pageHelper;
    const limit = req.query.limit || limitHelper;
    let filter = req.query.filter || {};

    if (req.query.search) {
      filter = {
        ...filter,
        title: { $regex: req.query.search, $options: "i" },
      };
    }

    if (req.session && req.session.user && req.session.user.role == "agent") {
      filter = { uploadedBy: req.session.user.userId };
    } else {
    }
    const property = await getAllPropertyHelper(
      filter,
      { page: page, limit: limit },
      {},
      ["location"]
    );
    console.log(property);

    res.status(200).json({
      success: true,
      message: "Property fetched successfully",
      data: {
        property: property.results,
        pagination: property.pagination,
        currentUrl: req.originalUrl.split("?")[0],
        limit: limitHelper,
        pageTitle: "Property",
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






router.get("/filter-property", async (req, res) => {
    try {
        let filter = {};

        // Helper to convert a param to array
        const toArray = (param) => {
            if (!param) return null;
            return Array.isArray(param) ? param : [param];
        }

        // Location (string or array)
        if (req.query.location) {
            const locations = toArray(req.query.location);
            filter.location = locations.length === 1 ? locations[0] : { $in: locations };
        }

        // Property Type
        if (req.query.propertyType) {
            const types = toArray(req.query.propertyType);
            filter.propertyType = { $in: types };
        }

        // Property Stage
        if (req.query.propertyStage) {
            const stages = toArray(req.query.propertyStage);
            filter.propertyStage = { $in: stages };
        }

        // Property Status
        if (req.query.propertyStatus) {
            const statuses = toArray(req.query.propertyStatus);
            filter.propertyStatus = { $in: statuses };
        }

        // Rooms
        if (req.query.rooms) {
            const rooms = toArray(req.query.rooms);
            filter['additionalInformation.rooms'] = { $in: rooms.map(Number) };
        }

        // Bathrooms
        if (req.query.bathrooms) {
            const baths = toArray(req.query.bathrooms);
            filter['additionalInformation.bathrooms'] = { $in: baths.map(Number) };
        }

        if (req.query.priceFrom) {
            filter.priceFrom = { $gte: Number(req.query.priceFrom) };
        }
        // Price
        if (req.query.priceTo) {
            console.log(req.query)
            filter.priceTo = { $lte: Number(req.query.priceTo) };
        }
        // Area ranges (can handle multiple ranges if needed)
        console.log(req.query.area)
        if (req.query.area) {
            console.log("in area")
            const areas = toArray(req.query.area);
            // ["0-1000", "1001-3000", ...]
            if (areas.length == 1) {
                const [from, to] = areas[0].split("-");
                console.log(to)
                if (to == "8000+") {
                    filter.areaFrom = { $gte: Number(from) };
                    filter.areaT = { $gte: Number(to) };
                } else {
                    console.log("in 8000")
                    filter.$or = [
                        { areaFrom: { $gte: Number(from), $lte: Number(to) } },
                        { areaTo: { $gte: Number(from), $lte: Number(to) } }
                    ];
                }
            } else if (areas.length > 1) {
                // Match if any range overlaps
                // filter.$or
               let tempAreaFilter= areas.map(range => {
                    const [from, to] = range.split("-");
                    console.log(to == 8000)
                    if (to == "8000+") {
                        return {
                            areaFrom: { $gte: Number(from) },
                            areaTo: { $gte: Number(from) }
                        };
                    } else {
                        return [
                            { areaFrom: { $gte: Number(from), $lte: Number(to) } },// either any of the contiion true property will be returned
                            { areaTo: { $gte: Number(from), $lte: Number(to) } }
                        ];
                    }
                });
                tempAreaFilter=tempAreaFilter.flat(2)
                console.log(tempAreaFilter)
                filter.$or=tempAreaFilter

              
                
            }
        }

        let page = req.query.page || pageHelper;
        let limit = req.query.limit || limitHelper;
        console.log("filter", filter)

        const property = await getAllPropertyHelper(filter, { page: page, limit: limit }, {}, ["amenities","location"])
        console.log(property.results[0])
        console.log("property",property)

        res.json({
            success: true,
            message: "property fetched successfully",
            data: {
                property: property.results,
                pagination: property.pagination
                // queryString: new URLSearchParams(rest).toString()
            }
        });
    } catch (error) {
        console.log("error",error)
        res.json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
})

router.get("/edit-property", async (req, res) => {
    try {
        const amenities = await getAllAmenities({}, { limit: 100 })
        const location = await getAllLocations();

        res.status(200).json({
            success: true,
            message: "Success: Edit Info Fetched",
            data: {
                propertyType: propertyTypeHelper,
                propertyStatus: propertyStatusHelper,
                rooms: apartmentTypeHelper,
                area: propertyAreaHelper,
                bathrooms: bathroomHelper,
                amenities: amenities.results,
                propertyStage: propertyStageHelper,
                location: location.results,
                listingStatus: listingStatusHelper,
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


router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const property = await getAllPropertyHelper({ _id: id }, {}, {}, ["amenities","location"]);
        console.log(property.results[0]?.amenities)

        res.status(200).json({
            success: true,
            message: "Success: Properties Fetched",
            data: {
                property: property.results[0]
            }
        })
    } catch (error) {
        res.json({
            success: false,
            message: "Failed: Product not Fetched",
            error: error.message || "Server Error"
        })
    }
})


router.post("/compare", async (req, res) => {
    try {
        const { ids } = req.body;
        console.log(ids)
        if (!Array.isArray(ids) || ids.length == 0) {
            return res.status(400).json({
                message: "No Property Ids Provided"
            })
        }
        const properties = await getAllPropertyHelper({_id:{$in:ids}},{},{},["amenities","location"])
        res.json({
            sucess: true,
            message:"properties  successfully fetched",
            property: properties.results
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})


// auth
router.put(
  "/:id",
  upload.fields([
    { name: "imageUrl", maxCount: 1 },
    { name: "secondaryImageUrl", maxCount: 10 },
  ]),
  editProperty
);

// for dashboard users



module.exports=router
