const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");
const Appointment = require("../model/appointments");
const { getAllAppointments } = require("../service/appointments");
const { getAllAgents } = require("../service/user");
const { pageHelper, limitHelper, timeHelper } = require("../utils/data");

const listAppointments = asyncHandler(async (req, res) => {
  const page = req.query.page || pageHelper;
  const limit = req.query.limit || limitHelper;
  let filter = req.query.filter || {};
  if (req.query.search) filter = { ...filter, clientName: { $regex: req.query.search, $options: "i" } };
  if (req.session?.user?.role == "agent") filter = { ...filter, assigned: req.session.user.userId };
  const appointment = await getAllAppointments(filter, { page, limit }, {}, ["assigned"]);
  res.status(200).json({ success: true, message: "Appointments fetched successfully", data: { appointment: appointment.results, pagination: appointment.pagination, currentUrl: req.originalUrl.split("?")[0], limit: limitHelper, pageTitle: "Appointment" } });
});

const editAppointmentData = asyncHandler(async (req, res) => {
  const agents = await getAllAgents();
  res.status(200).json({ success: true, data: { agent: agents.results, time: timeHelper }, message: "Appointment fetched successfully" });
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id);
  if (!appointment) throw new AppError("Appointment not found", 404);
  res.status(200).json({ success: true, data: appointment });
});

const updateAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await Appointment.findByIdAndUpdate(id, req.body, { new: true });
  res.status(200).json({ success: true, message: "Success: Updated SuccessFully", data: result });
});

module.exports = { listAppointments, editAppointmentData, getAppointmentById, updateAppointment };
