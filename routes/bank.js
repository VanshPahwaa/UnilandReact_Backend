const express=require("express")
const {  getAllLocations,getAllBanks } = require("../helper/helperForModels.js");
const { limitHelper, pageHelper} = require("../utils/data.js");
const Bank=require("../model/bank.js");
const {upload}=require("../config/multerconfig.js")
const router = express.Router();



// BANK
router.post("/", upload.single("bankLogo"), async (req, res) => {
  try {
    console.log(req.body);
    let path = "";
    if (req.file.path) {
      path = req.file.path;
    }
    console.log(req.file);
    const result = await Bank.create({ ...req.body, bankLogo: path }); // in case any validation failed then control will directly go to catch block
    console.log("result after creation", result);
    if (!result) {
      throw new Error("Bank are not able to upload");
    }
    res.status(200).json({
      success: true,
      message: "Bank Uploaded Successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Internal Server Error",
      error: error.message || "Internel Server Error",
    });
  }
});

router.put("/:id", upload.single("bankLogo"), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (req.file) {
      console.log(req.file);
      const newImagePath = req.file.path;
      const bank = await Bank.findById(id);

      if (bank && bank.bankLogo) {
        const oldImagePath = path.join(process.cwd(), bank.bankLogo);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updates.bankLogo = newImagePath;
    }

    const updatedBank = await Bank.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedBank) {
      throw new Error("Bank are not able to upload");
    }
    res.status(200).json({
      success: true,
      message: "Bank Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message || "Internel Server Error",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const bank = await getAllBanks({ _id: id });

    console.log(bank);
    res.json({
      success: true,
      data: {
        bank: bank.results[0],
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message || "Internel Server Error",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const page = req.query.page || pageHelper;
    const limit = req.query.limit || limitHelper;
    let filter = req.query.filter || {};
    if (req.query.search) {
      filter = {
        ...filter,
        bankName: { $regex: req.query.search, $options: "i" },
      };
    }

    // console.log(page,limit,filter)
    const banks = await getAllBanks(filter, { page: page, limit: limit });

    console.log(banks);

    res.json({
      success: true,
      message: "Banks fetched successfully",
      data: {
        bank: banks.results,
        pagination: banks.pagination,
        currentUrl: req.originalUrl.split("?")[0],
        limit: limitHelper,
        pageTitle: "Banks",
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message || "Internel Server Error",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const bank = await Bank.findById(id);
    if (!bank || bank.length == 0) {
      // if not bank exist or returnd bank is array and its length is zero
      return res.status(404).json({
        success: false,
        message: "Bank not Found",
      });
    }

    if (bank && bank.bankLogo) {
      const imagePath = path.join(process.cwd(), bank.bankLogo);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    await Bank.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Bank Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message || "Internel Server Error",
    });
  }
});

module.exports=router;