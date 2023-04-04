const nodemailer = require("nodemailer");
const logger = require("../logger");
const dotenv = require("dotenv");
dotenv.config();
const { SMTP_MAIL, SMTP_PASSWORD } = process.env;

/*
@Send_Registration_Email:
    Description:                    will be used to notify user that you have been successfully registered
*/

exports.sendRegistrationMail = email => {
  const msg = "Thanks for registering";

  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: SMTP_MAIL,
      pass: SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: SMTP_MAIL,
    to: email,
    subject: `Welcome to our Company Mr. ${email}`,
    html: `Dear <b>${email},</b> ${msg} `,
  };

  return new Promise(function (resolve, reject) {
    transport.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error);

        // logger.error(error);

        return error;
      } else {
        resolve(info);
        // logger.info("info.accepted", info.accepted);
        // logger.info("info.accepted", info);

        return info;
      }
    });
  });
};

/*
@Send_Password_Reset_Email:
    Description:                    will send user token/link which is then use to update password
*/

exports.sendPasswordResetMail = (email, token) => {
  // logger.info("reset email starting here");

  const msg = `<a href="http://localhost:4000/reset/${token}">Reset Link</a>
  `;

  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: SMTP_MAIL,
      pass: SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: SMTP_MAIL,
    to: email,
    subject: `Reset Password Link`,
    html: `Dear <b>${email},</b> <p>here is your reset code ${token} <p>Kindly enter your code in this link</p> </p> ${msg} `,
  };

  return new Promise(function (resolve, reject) {
    transport.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error);

        // logger.error(error);

        return error;
      } else {
        resolve(info);

        // logger.info("info.accepted", info.accepted);
        // logger.info("info.accepted", info);

        return info;
      }
    });
  });
};

/*
@Send_Password_Updated_Email:
    Description:                    will notify user via email after updating password
*/

exports.sendPasswordUpdatedMail = email => {
  const msg =
    "Your password has been updated use your password to login into the system";

  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: SMTP_MAIL,
      pass: SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: SMTP_MAIL,
    to: email,
    subject: `Password Updated ${email}`,
    html: `Dear <b>${email},</b> ${msg} `,
  };

  return new Promise(function (resolve, reject) {
    transport.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error);

        // logger.error(error);

        return error;
      } else {
        resolve(info);
        // logger.info("info.accepted", info.accepted);
        // logger.info("info.accepted", info);

        return info;
      }
    });
  });
};
