const express = require("express");
const { createBank, updateBank, getBankById, listBanks, deleteBank, getUploadConfig } = require("../controller/bank");
const router = express.Router();

router.get("/upload-config", getUploadConfig);
router.post("/", createBank);
router.put("/:id", updateBank);
router.get("/:id", getBankById);
router.get("/", listBanks);
router.delete("/:id", deleteBank);

module.exports = router;