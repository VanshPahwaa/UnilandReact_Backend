const express=require("express")
const router=express.Router()


router.get("/", (req, res) => {
    try {
        res.render("admin/dashboard")
    } catch (error) {
        res.render("common/500.ejs")
    }
})

router.get("/agents", (req, res) => {
    try {
        res.render("admin/dashboard-agent.ejs")
    } catch (error) {
        res.render("500.ejs", {})
    }
})


router.get("/submit-property", async (req, res) => {
    try {
        const propertyType = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/propertyTypes.json"), "utf-8"))
        const propertyStatus = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/propertyStatus.json"), "utf-8"))
        let amenities = await fetch(process.env.CLIENT_URL + "propertyAttribute/amenity")
        amenities = await amenities.json()
        console.log(amenities)
        res.render("admin/dashboard-submit-property.ejs", {
            success: true,
            message: "Success",
            data: {
                propertyType: propertyType,
                propertyStatus: propertyStatus,
                amenities: amenities.data
            }
        })
    } catch (error) {
        res.render("common/500.ejs", {
            success: false,
            message: "Internal Server Error",
            error: error.message || "Internal Server Error"
        })

    }
})


module.exports=router