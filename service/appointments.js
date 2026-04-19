const Appointment = require("../model/appointments.js");
const paginate = require("../utils/paginate");

const getAllAppointments = async (filters = {}, option = {}, projection = null, populate = null) => {
  return paginate(Appointment, filters, option, projection, populate);
};

module.exports = { getAllAppointments };
