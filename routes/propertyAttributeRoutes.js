const { Amenity, PropertyType,PropertyStatus } = require("../model/propertyAttributeModels");
const express = require("express")
const router = express.Router()

router.get("/amenity", async (req, res) => {
    try {
        const amenities = await Amenity.find();
        if (!amenities || amenities.length < 1) {
            throw new Error("Failed Product Not Found")
        }
        return res.status(200).json({
            success: true,
            message: "Success: Product Successfully fetched",
            data: amenities
        })

    } catch (error) {
        res.json({
            success: false,
            message: "Failed:Internal server Error",
            error: error.message || "Internal server Error"
        })
    }
})
    .post("/amenity", async (req, res) => {
        try {
            const { name } = req.body
            const result = await Amenity.create({ name: name })
            console.log(result)
            if (!result) {
                throw new Error("Failed")
            }

            return res.status(200).json({
                success: true,
                message: "Success: Product Successfully fetched",
                data: result
            })

        } catch (error) {
            res.json({
                success: false,
                message: "Failed:Internal server Error",
                error: error.message || "Internal server Error"
            })

        }
    })
    .put("/amenity/:id", async (req, res) => {
        try {
            const {id}=req.params
            
            const result = await Amenity.findByIdAndUpdate(id,req.body)
            console.log(result)
            if (!result) {
                throw new Error("Failed: Not Able to update")
            }

            return res.status(200).json({
                success: true,
                message: "Success: Amenity Updated Successfully"
            })

        } catch (error) {
            res.json({
                success: false,
                message: "Failed:Internal server Error",
                error: error.message || "Internal server Error"
            })

        }
    })
    .post("/propertyType", async (req, res) => {
        try {
            const { propertyType } = req.body;
            const result = await PropertyType.create({ category: propertyType })
            console.log(result)
            if (!result) {
                throw new Error("Failed")
            }

            return res.status(200).json({
                success: true,
                message: "Success: Product Successfully fetched",
                data: result
            })

        } catch (error) {
            res.json({
                success: false,
                message: "Failed:Internal server Error",
                error: error.message || "Internal server Error"
            })

        }
    })
    .get("/propertyType", async (req, res) => {
        try {
            const types = await PropertyType.find();
            if (!types || types.length < 1) {
                throw new Error("Failed Product Not Found")
            }
            return res.status(200).json({
                success: true,
                message: "Success: Product Successfully fetched",
                data: types
            })
        } catch (error) {
            res.json({
                success: false,
                message: "Failed:Internal server Error",
                error: error.message || "Internal server Error"
            })
        }
    })
    .post("/propertyStatus", async (req, res) => {
        try {
            const { propertyStatus } = req.body;
            console.log(propertyStatus,req.body)
            const result = await PropertyStatus.create({ status: propertyStatus})
            console.log(result)
            if (!result) {
                throw new Error("Failed")
            }

            return res.status(200).json({
                success: true,
                message: "Success: Product Successfully fetched",
                data: result
            })

        } catch (error) {
            res.json({
                success: false,
                message: "Failed:Internal server Error",
                error: error.message || "Internal server Error"
            })

        }
    })
    .get("/propertyStatus", async (req, res) => {
        try {
            const Status = await PropertyStatus.find();
            if (!Status || Status.length < 1) {
                throw new Error("Failed Product Not Found")
            }
            return res.status(200).json({
                success: true,
                message: "Success: Product Successfully fetched",
                data: Status
            })
        } catch (error) {
            res.json({
                success: false,
                message: "Failed:Internal server Error",
                error: error.message || "Internal server Error"
            })
        }
    })


module.exports = router