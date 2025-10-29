const express = require("express")
const app = express();
const router = express.Router()
const Location = require("../../model/location")
const paginate=require("../../utils/paginate")

router.get("/", async (req, res) => {
    try {
        const location=await paginate(Location,{})
        console.log(location)
        if (!location.results.length) {
            return res.status(404).json({
                success: false,
                message: "Locations not found",
            })
        }
        res.status(200).json({
            success: true,
            message: "Locations Fetched Successfully",
            data: {
                location:location.results,
                pagination:location.pagination
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message

        })

    }
})


router.post("/", async (req, res) => {
    try {
        const result = await Location.create(req.body);// in case any validation failed then control will directly go to catch block
        if (!result) {
            throw new Error("Location are not able to upload")
        }
        res.status(200).json({
            success: true,
            message: "Locations Uploaded Successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message || "Internel Server Error"
        })
    }
})

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params
        const result = await Location.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Success: Deleted SuccessFully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message || "Internal Server Error"
        })

    }
})

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params
        console.log(req.body)
        const result = await Location.findByIdAndUpdate(id,req.body);
        res.status(200).json({
            success: true,
            message: "Success: Updated SuccessFully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message || "Internal Server Error"
        })

    }
})

module.exports = router