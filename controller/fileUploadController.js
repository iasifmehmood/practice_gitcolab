/*
@File_Upload:
    Description:                      user can upload single image: png,jpgg,jpeg or pdf documents 
    Conditionals:                     if req.file contains some file it will display file is successfully uploaded message
    Catch:                            will catch error if something else happend other than above mentioned scenarios.
*/

exports.fileUpload = async (req, res) => {
  // console.log("controller", req.file);
  try {
    if (req.file) {
      res.status(200).json({
        status: "success",
        messsage: "File is successfully upload",
      });
    }
  } catch (error) {
    res.status(400).json({
      status: "success",
      messsage: "File error",
      error,
    });
  }
};
