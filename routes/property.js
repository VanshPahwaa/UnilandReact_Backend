const express=require("express")
const router=express.Router()
const { createProperty,getProperty, getAllProperty,getFilteredProperty } = require("../controller/property")
const {upload}=require("../common/multerconfig")




router.get("/property", async (req, res) => {
    try {
        const page = req.query.page || pageHelper;
        const limit = req.query.limit || limitHelper;
        let filter = req.query.filter || {};

        if (req.query.search) {
            filter = { ...filter, title: { $regex: req.query.search, $options: "i" } }
        }


        if (req.session.user.role == "agent") {
            filter = { uploadedBy: req.session.user.userId }
        } else {

        }
        const property = await getAllPropertyHelper(filter, { page: page, limit: limit });


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
        res.render("common/500.ejs", {
            success: false,
            message: "Failed: Internal Server Error",
            error: error.message
        })
    }
})

router.get("/property/:id", async (req, res) => {
    try {

        const { id } = req.params;
        const property = await getAllPropertyHelper({ _id: id });

        res.status(200).json({
            success: true,
            message: "Success: Properties Fetched",
            data: {
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

router.post("/",upload.single("imageUrl"), createProperty)
// .get("/:propertyId",getProperty)
// .get("/",getAllProperty)
// .get("/search",getFilteredProperty)

// app.post("/property/add-property", upload.single("image"), (req, res) => {
//     console.log("request recieved")
//     console.log(req.file);
//     res.send("property  added with image!");
// })



module.exports=router
