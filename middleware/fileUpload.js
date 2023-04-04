const multer = require("multer");
const { fileStorage, fileFilter } = require("../services/fileStorageFilter");

upload = multer({ storage: fileStorage, fileFilter: fileFilter }).single(
  "file"
);

/*
@File_Upload_Check:
    Description:                      this middleware will check if uploaded file is image: png,jpgg,jpeg or pdf document 
    Conditionals:                     it will through error if file does noot contains above mentioned file format
*/

exports.fileUploadCheck = (req, res, next) => {
  return upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.

      return res.status(400).json({
        status: "fail",
        message: `Uploading has failed `,
        err,
      });
    } else if (err) {
      // An unknown error occurred when uploading.

      return res.status(400).json({
        status: "fail",
        message: `Uploading has failed (only jpg,jpeg,png and pdf allow). You Uploaded ${req.fileExtensionCheck} file `,
        err,
      });
    }

    // console.log("middleware", req.file);

    next();

    // Everything went fine.
  });
};
