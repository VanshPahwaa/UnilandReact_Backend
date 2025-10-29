const express=require("express")
const router=express.Router()
const { createProperty,getProperty, getAllProperty,getFilteredProperty, editProperty } = require("../../controller/property")
const {upload}=require("../../common/multerconfig")


// router.post("/",upload.single("imageUrl"), createProperty)

router.post("/",upload.fields([
    {name:"imageUrl",maxCount:1},
    {name:"secondaryImageUrl",maxCount:10}]), createProperty)  
    
.get("/filter",getFilteredProperty)

.put("/:id",upload.fields([
    {name:"imageUrl",maxCount:1},
    {name:"secondaryImageUrl",maxCount:10}]),editProperty)
    
.get("/:propertyId",getProperty)

.get("/",getAllProperty)


// app.post("/property/add-property", upload.single("image"), (req, res) => {
//     console.log("request recieved")
//     console.log(req.file);
//     res.send("property  added with image!");
// })



module.exports=router
