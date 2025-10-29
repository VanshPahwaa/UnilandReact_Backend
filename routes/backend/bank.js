const express = require("express")
const app = express();
const router = express.Router()
const Bank = require("../../model/bank.js")

router.get("/", async (req, res) => {
    try {
        const locations = await Bank.find();
        if (!locations.length) {
            return res.status(404).json({
                success: false,
                message: "Banks not found",
            })
        }
        res.status(200).json({
            success: true,
            message: "Banks Fetched Successfully",
            data: {
                location: locations
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
        const result = await Bank.create(req.body);
        console.log(result)
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Banks not found",
            })
        }
        res.status(200).json({
            success: true,
            message: "Data Uploaded Successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message || "Internel Server Error"
        })
    }
})


module.exports=router;