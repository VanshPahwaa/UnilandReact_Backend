const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");
const Bank = require("../model/bank");
const { getAllBanks } = require("../service/bank");
const { pageHelper, limitHelper } = require("../utils/data");
const { generatePresignedPostConfig, moveTempToPermanent, deleteS3Object } = require("../service/s3Service");

/**
 * Generates S3 pre-signed POST config for direct uploads.
 */
const getUploadConfig = asyncHandler(async (req, res) => {
  const { fileType, fileName } = req.query;
  if (!fileType || !fileType.startsWith("image/")) {
    throw new AppError("Only image files are allowed", 400);
  }
  const config = await generatePresignedPostConfig(fileType, fileName || "bank-logo.png");
  console.log(config);
  res.status(200).json({ success: true, data: config });
});

const createBank = asyncHandler(async (req, res) => {
  const { bankName, rateOfInterest, imageKey } = req.body;

  // 1. Validate and Create bank as PENDING
  const bank = await Bank.create({
    bankName,
    rateOfInterest,
    bankLogo: imageKey, // temporarily store temp key
    status: "PENDING"
  });

  if (!bank) throw new AppError("Error creating bank record", 400);

  // 2. Move image from temp to permanent if provided
  if (imageKey) {
    const permanentKey = await moveTempToPermanent(imageKey);

    // 3. Update DB with permanent path and set to ACTIVE
    bank.bankLogo = permanentKey;
    bank.status = "ACTIVE";
    await bank.save();
  } else {
    // If no image, set to ACTIVE (or handle as per requirement)
    bank.status = "ACTIVE";
    await bank.save();
  }

  res.status(200).json({ success: true, message: "Bank Created Successfully", data: bank });
});

const updateBank = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { bankName, rateOfInterest, imageKey } = req.body;

  const bank = await Bank.findById(id);
  if (!bank) throw new AppError("Bank not found", 404);

  const updates = { bankName, rateOfInterest };

  if (imageKey) {
    // Move new image to permanent
    const permanentKey = await moveTempToPermanent(imageKey);

    // Delete old image from S3 if it exists
    if (bank.bankLogo) {
      await deleteS3Object(bank.bankLogo);
    }

    updates.bankLogo = permanentKey;
  }

  const updatedBank = await Bank.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

  res.status(200).json({ success: true, message: "Bank Updated Successfully", data: updatedBank });
});

const getBankById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const bank = await getAllBanks({ _id: id });
  if (!bank || !bank.results || bank.results.length === 0) throw new AppError("Bank not found", 404);
  res.json({ success: true, data: { bank: bank.results[0] } });
});

const listBanks = asyncHandler(async (req, res) => {
  const page = req.query.page || pageHelper;
  const limit = req.query.limit || limitHelper;
  let filter = req.query.filter || {};
  if (req.query.search) filter = { ...filter, bankName: { $regex: req.query.search, $options: "i" } };
  const banks = await getAllBanks(filter, { page, limit });
  res.json({ success: true, message: "Banks fetched successfully", data: { bank: banks.results, pagination: banks.pagination, currentUrl: req.originalUrl.split("?")[0], limit: limitHelper } });
});

const deleteBank = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const bank = await Bank.findById(id);
  if (!bank) throw new AppError("Bank not found", 404);

  if (bank.bankLogo) {
    await deleteS3Object(bank.bankLogo);
  }

  await Bank.findByIdAndDelete(id);
  res.json({ success: true, message: "Bank deleted successfully" });
});

module.exports = { createBank, updateBank, getBankById, listBanks, deleteBank, getUploadConfig };
