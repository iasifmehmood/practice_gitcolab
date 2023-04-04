const multer = require("multer");
let fs = require("fs-extra");

/*
@File_Storage:
    Description:                      will create path to store document and gives original document name and format 
*/

exports.fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let path = "./uploaded_images";
    fs.mkdirsSync(path);
    cb(null, path);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + file.originalname);
  },
});

/*
@File_Filter:
    Description:                      will filter documents (documents should contain specified format only) 
*/

exports.fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else if (file.mimetype === "application/pdf") {
    // console.log("pdf");
    cb(null, true);
  } else {
    // console.log("other files are not allowed");
    // req.fileTypeCheck = file.mimetype;

    req.fileExtensionCheck = file.originalname.split(".").pop();

    cb(null, false);
    return cb(
      new Error("only jpg,jpeg,png and pdf allow"),
      req.fileExtensionCheck
    );
  }
};
