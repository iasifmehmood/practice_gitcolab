const logger = require("../logger");
const password_schema = require("../services/passwordValidation");
const email_validator = require("../services/emailValidation");

exports.logInvalidationCheck = (req, res, next) => {
  //   logger.info("validation started");

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please Provide an email and password",
    });
  } else {
    if (!email_validator.validate(email)) {
      return res.status(400).json({
        status: "incorrect email format",
        message: "email format should be: asif@email.com  ",
      });
    }

    if (!password_schema.validate(password)) {
      return res.status(400).json({
        status: "incorrect password format",
        message:
          "Password must have min 8 character and must contain (Uppercase,Lowercase and digits only) ",
      });
    }
  }

  next();
};

exports.signUpvalidationCheck = (req, res, next) => {
  //   logger.info("validation started");

  const { email, confirm_password, password, cnic } = req.body;

  if (confirm_password != password) {
    return res.status(400).json({
      status: "fail",
      message: "password does not match re-enter password password ",
    });
  }

  if (!(cnic.length === 13 && cnic.match(/^[0-9]+$/) != null)) {
    return res.status(400).json({
      status: "fail",
      message: "incorrect cnic or enter 13 digit cnic",
    });
  }

  if (!email_validator.validate(email)) {
    return res.status(400).json({
      status: "fail",
      message:
        "incorrect email format: email format should be: asif@email.com  ",
    });
  }

  if (!password_schema.validate(password)) {
    return res.status(400).json({
      status: "fail",
      message:
        "incorrect password format: Password must have min 8 character and must contain (Uppercase,Lowercase and digits only) ",
    });
  }

  next();
};

exports.resetEmailCheck = (req, res, next) => {
  //   logger.info("validation started");

  const { email } = req.body;

  if (!email_validator.validate(email)) {
    return res.status(400).json({
      status: "fail",
      message:
        "incorrect email format: email format should be: asif@email.com  ",
    });
  }

  next();
};

exports.resetPasswordCheck = (req, res, next) => {
  //   logger.info("validation started");

  const { confirm_password, password } = req.body;

  if (confirm_password != password) {
    return res.status(400).json({
      status: "fail",
      message: "password does not match re-enter password password ",
    });
  }

  if (!password_schema.validate(password)) {
    return res.status(400).json({
      status: "fail",
      message:
        "incorrect password format: Password must have min 8 character and must contain (Uppercase,Lowercase and digits only) ",
    });
  }

  next();
};
