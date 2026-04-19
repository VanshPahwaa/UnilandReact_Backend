const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");
const Lead = require("../model/lead");
const ExcelJS = require("exceljs");
const { getAllLeads } = require("../service/lead");
const { getAllLocations } = require("../service/location");
const { getAllAgents } = require("../service/user");
const { pageHelper, limitHelper, leadTypeHelper, leadStatusHelper } = require("../utils/data");

const getEditLeadBasic = asyncHandler(async (req, res) => {
  const location = await getAllLocations();
  console.log("in basic one",location);
  
  let data = { location: location.results, leadType: leadTypeHelper, leadStatus: leadStatusHelper };
  if (req?.session?.user?.role == "admin") {
    const agent = await getAllAgents();
    data = { ...data, agent: agent.results };
  }
  res.status(200).json({ success: true, message: "Edit Data fetched successfully", data });
});

const createQuery = asyncHandler(async (req, res) => {
  const { clientName, location, email, mobileNumber, leadType, propertyInterested } = req.body;
  let allowedEntries = { clientName, location: location, email, mobileNumber, leadType };
  if (propertyInterested) allowedEntries = { ...allowedEntries, propertyInterested };
  await Lead.create(allowedEntries);
  res.status(201).json({ success: true, message: "Query Recieved successfully" });
});

const getLeadsByStatus = (status) =>
  asyncHandler(async (req, res) => {
    const page = req.query.page || pageHelper;
    const limit = req.query.limit || limitHelper;
    let filter = req.query.filter || {};
    filter = { leadStatus: status };
    if (req.session && req.session.user && req.session.user.role == "agent") filter = { ...filter, assigned: req.session.user.userId };
    if (req.query.search) filter = { ...filter, clientName: { $regex: req.query.search, $options: "i" } };
    const leads = await getAllLeads(filter, { page, limit }, {}, ["assigned"]);
    res.status(200).json({ success: true, message: "Lead fetched successfully", data: { lead: leads.results, pagination: leads.pagination, currentUrl: req.originalUrl.split("?")[0], limit: limitHelper, pageTitle: `${status.charAt(0).toUpperCase() + status.slice(1)} Leads` } });
  });

const getEditLeadFull = asyncHandler(async (req, res) => {
  const agents = await getAllAgents();
  const location = await getAllLocations();
  console.log("location",location);
  res.status(200).json({ success: true, message: "Edit Data fetched successfully", data: { agent: agents.results, location: location.results, leadType: leadTypeHelper, leadStatus: leadStatusHelper } });
});

const createLead = asyncHandler(async (req, res) => {
  const { clientName, location, email, mobileNumber, assigned } = req.body;
  const allowedEntries = { clientName, location: location, email, mobileNumber };
  await Lead.create(allowedEntries);
  res.status(201).json({ success: true, message: "Lead created successfully" });
});

const downloadCustomerExcel = asyncHandler(async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Customer-Data");
  worksheet.columns = [
    { header: "Name", key: "name", width: 20 },
    { header: "Mobile Number", key: "mobileNumber", width: 20 },
    { header: "Email", key: "email", width: 15 },
  ];

  let filter = {};
  if (req.query.fromDate) filter = { ...filter, createdAt: { $gte: req.query.fromDate } };
  if (req.query.toDate) filter = { ...filter, createdAt: { $lte: req.query.toDate } };

  const customerData = await Lead.find(filter).lean();
  customerData.forEach((app) => {
    worksheet.addRow({ name: app.clientName, mobileNumber: app.mobileNumber, email: app.email });
  });

  res.setHeader("Content-Disposition", 'attachment; filename="customerData.xlsx"');
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  await workbook.xlsx.write(res);
  res.end();
});

const getCustomerData = asyncHandler(async (req, res) => {
  const page = req.query.page || pageHelper;
  const limit = req.query.limit || limitHelper;
  let filter = req.query.filter || {};
  if (req.query.fromDate || req.query.toDate) {
    filter.createdAt = {};
    if (req.query.fromDate) filter.createdAt.$gte = new Date(req.query.fromDate);
    if (req.query.toDate) filter.createdAt.$lte = new Date(req.query.toDate);
  }
  const customer = await getAllLeads(filter, { page, limit });
  res.status(200).json({ success: true, message: "Customer Data fetched successfully", data: { customerData: customer.results, pagination: customer.pagination, currentUrl: req.originalUrl.split("?")[0], limit: limitHelper, pageTitle: "Customer" } });
});

const getLeadById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lead = await getAllLeads({ _id: id });
  if (!lead || !lead.results || lead.results.length === 0) throw new AppError("Lead not found", 404);
  res.json({ success: true, data: { lead: lead.results[0] } });
});

const updateLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { clientName, location, email, mobileNumber, assigned, leadStatus } = req.body;
  let allowedEntries = { clientName, location: location, email, mobileNumber, assigned, leadStatus };
  if (req.session.user.role == "admin") allowedEntries = { ...allowedEntries, assigned };
  await Lead.findByIdAndUpdate(id, allowedEntries);
  res.status(201).json({ success: true, message: "Lead updated successfully" });
});

module.exports = {
  getEditLeadBasic,
  createQuery,
  getLeadsByStatus,
  getEditLeadFull,
  createLead,
  downloadCustomerExcel,
  getCustomerData,
  getLeadById,
  updateLead,
};
