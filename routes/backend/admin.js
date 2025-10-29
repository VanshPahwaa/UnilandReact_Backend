const mongoose=require("mongoose")
const express=require("express")

const User=require("../../model/user");
const Location=require("../../model/location");
const Lead = require("../../model/lead");
const Appointment=require("../../model/appointments.js")
const Bank=require("../../model/bank.js")
const {upload}=require("../../common/multerconfig")
const fs=require("fs")
const path=require("path")


const agentRouter=require("./agentForAdmin");
const propertyAttributeRouter=require("../propertyAttributeRoutes")


const router = express.Router();


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

// GET: Fetch all Agent
// router.get("/agents", async (req, res) => {
//   try {
//     const agents = await User.find({role:"agent"});
//     console.log(agents)
//     res.status(200).json({
//       success: true,
//       message: "agent fetched successfully",
//       data: agents
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Error fetching leads",
//       error: err.message
//     });
//   }
// });

router.patch("/lead/:id", async (req, res) => {
  try {
    const {id}=req.params
    console.log(id);
    const lead = await Lead.findByIdAndUpdate(id,req.body); // req.body must match schema
    if(!lead){
      return res.status(404).json({
        success:false,
        message:"Lead Not found"
      })
    }

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error: Not able to update",
      error: err.message || "internal server error"
    });
  }
});



//LOCATION
router.put("/location/:id", async (req, res) => {
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
router.post("/location/", async (req, res) => {
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


// APPOINTMENT
router.put("/appointment/:id", async (req, res) => {
    try {
        const { id } = req.params
 let appointment=await Appointment.findById(id)
    if(appointment.assigned==req.body.assigned){
      await appointment.save()
    }else{
      if(appointment.assigned){
        await User.findByIdAndUpdate({_id:appointment.assigned},{$pull:{'agentSpecificDetails.appointments':appointment._id}})
      }
      await User.findByIdAndUpdate({_id:req.body.assigned},{$push:{'agentSpecificDetails.appointments':appointment._id}})
    //  const oldAgent= User.findById(lead.assigned);
    //  oldAgent.agentSpecificDetails.leads.filter(id=>id.toString()!==lead._id)
    }
        console.log(req.body)
        const result = await Appointment.findByIdAndUpdate(id,req.body);
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



router.post("/bank/",upload.single("bankLogo"),async (req, res) => {
    try {
      console.log(req.body)
      let path=""
      console.log(req.file)
      if(req.file.path){
        path=req.file.path
      }
        const result = await Bank.create({...req.body,bankLogo:path});// in case any validation failed then control will directly go to catch block
        if (!result) {
            throw new Error("Bank are not able to upload")
        }
        
        res.status(200).json({
            success: true,
            message: "Bank Uploaded Successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message || "Internel Server Error"
        })
    }
})

router.put("/bank/:id",upload.single("bankLogo"),async (req, res) => {
    try {
        const {id}=req.params
        const updates={...req.body};

    
        if(req.file){
            console.log(req.file)
            const newImagePath=req.file.path
            const bank=await Bank.findById(id)

            if(bank && bank.bankLogo){
                const oldImagePath=path.join(process.cwd(),bank.bankLogo);
                if(fs.existsSync(oldImagePath)){
                    fs.unlinkSync(oldImagePath);
                }
            }
            updates.bankLogo=newImagePath
        }

        const updatedBank=await Bank.findByIdAndUpdate(id,updates,{
            new:true,
            runValidators:true
        })
    
      
        if (!updatedBank) {
            throw new Error("Bank are not able to upload")
        }
        res.status(200).json({
            success: true,
            message: "Bank Uploaded Successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message || "Internel Server Error"
        })
    }
})

router.delete("/bank/:id",async (req, res) => {
    try {
        const {id}=req.params
const bank=await Bank.findById(id)
if(!bank || bank.length==0){ // if not bank exist or returnd bank is array and its length is zero
    return res.status(404).json({
        success:false,
        message:"Bank not Found"
    })
}

if(bank && bank.bankLogo){
    const imagePath=path.join(process.cwd(),bank.bankLogo);
    if(fs.existsSync(imagePath)){
        fs.unlinkSync(imagePath)
    }
} 
      await Bank.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Bank Deleted Successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message || "Internel Server Error"
        })
    }
})


router.use("/agent",agentRouter);
router.use("/propertyAttribute",propertyAttributeRouter)



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
