const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");
const { getAllAgents } = require("../service/user");
const { getAllLocations } = require("../service/location");
const User = require("../model/user");
const { pageHelper, limitHelper } = require("../utils/data");

const listAgents = asyncHandler(async (req, res) => {
  const page = req.query.page || pageHelper;
  const limit = req.query.limit || limitHelper;
  let filter = req.query.filter || {};

  if (req.query.search) {
    filter = { ...filter, userName: { $regex: req.query.search, $options: "i" } };
  }

  const agents = await getAllAgents(filter, { page, limit }, {}, ["agentSpecificDetails.location"]);

  res.status(200).json({
    success: true,
    message: "Agent fetched successfully",
    data: {
      agent: agents.results,
      pagination: agents.pagination,
      currentUrl: req.originalUrl.split("?")[0],
      limit: limitHelper,
      pageTitle: "Agents",
    },
  });
});

const createAgent = asyncHandler(async (req, res) => {
  const { userName, location, password, email, mobileNumber } = req.body;
  const allowedEntries = { userName, "agentSpecificDetails.location": location, password, email, mobileNumber };
  const agent = await User.create(allowedEntries);
  if (!agent) throw new AppError("Error creating Agent", 400);
  res.status(201).json({ success: true, message: "Agent created successfully" });
});

const updateAgent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userName, location, password, email, mobileNumber } = req.body;
  const allowedEntries = { userName, location, password, email, mobileNumber };
  const agent = await User.findByIdAndUpdate(id, allowedEntries);
  if (!agent) throw new AppError("Error while updating agent", 400);
  res.status(201).json({ success: true, message: "Agent Updated successfully" });
});

const getEditAgentData = asyncHandler(async (req, res) => {
  const location = await getAllLocations();
  res.json({ success: true, message: "Location fetched successfully", data: { location: location.results } });
});

const getAgentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const agent = await getAllAgents({ _id: id });
  if (!agent || !agent.results || agent.results.length === 0) throw new AppError("Agent not found", 404);
  res.json({ success: true, data: { agent: agent.results[0] } });
});

module.exports = { listAgents, createAgent, updateAgent, getEditAgentData, getAgentById };
