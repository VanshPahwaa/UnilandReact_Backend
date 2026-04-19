const express=require("express")
const { listAppointments, editAppointmentData, getAppointmentById, updateAppointment } = require("../controller/appointments");

const router = express.Router();

router.get("/", listAppointments);
router.get("/edit-appointment", editAppointmentData);
router.get("/:id", getAppointmentById);
router.put("/:id", updateAppointment);

module.exports=router;