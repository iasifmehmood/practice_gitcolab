const express = require("express");
const { fileUploadCheck } = require("../middleware/fileUpload.js");
const controller = require("../controller/fileUploadController.js");

const router = express.Router();

router.post("/upload", fileUploadCheck, controller.fileUpload);

module.exports = router;
