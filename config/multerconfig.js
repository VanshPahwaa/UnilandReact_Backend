const multer = require("multer")
const path = require("path")
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
    limits: {
        fieldSize: 25 * 1024 * 1024, // 25MB for text fields
        fileSize: 25 * 1024 * 1024,  // 10MB per file
    },
})

exports.upload = multer({ storage: storage });
