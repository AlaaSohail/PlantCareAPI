const multer = require("multer");

const storage = multer.memoryStorage();

const analyzeUpload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = analyzeUpload;