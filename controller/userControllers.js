const logger = require('../logger');
const {
  updatePassword,
  insertSignUpData,
  getEmailFromDb,
  insertToken,
  insertTokenInDb,
  getTokenFromDb,
} = require('../model/userModels');
const sendMail = require('./sendMailController');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();
const { generateToken } = require('../services/generateToken');
const { decryptedPayload } = require('../services/generateToken');
const { fileUploadCheck } = require('../middleware/fileUpload');

/*
@Signup:
    Description:                      user will signup using email,password and cnic and will be notified via email.
    Variable_registration_data:       will get signup data from body.
    Function_insertSignUpData():      will add registration data to the database by running insert query.
    Function_sendRegistrationMail():  will sent registration email notification to the user. 
    Variable_sent:                    will store promise (sent email details like status, response etc.) returned by sendRegistrationMail().
    Conditionals:                     first condition will check if email is sent to user who is registering and second codition will check its status if it is "250" it means email sent successfully.
    Catch:                            will catch error if something else than above mentioned scenario occurs
*/

const signup = async (req, res) => {
  try {
    const registration_data = req.body;
    const { email } = req.body;

    await insertSignUpData(registration_data);

    const sent = await sendMail.sendRegistrationMail(registration_data.email);

    // logger.info(sent.accepted);
    // logger.info(sent.response);

    let emailResponse = sent.response;
    let emailSuccessResponse = '250';

    if (
      sent.accepted[0] === email &&
      emailResponse.substring(0, 3) === emailSuccessResponse
    ) {
      return res.status(200).json({
        status: 'success',
        message: 'Use signup successfully',
      });
    }
  } catch (error) {
    // const err = error.code;
    // console.log('error', MysqlErrorCodes.err);
    // logger.error(error);
    if (error.errno === -4039) {
      console.log('errno');
      return res.status(400).json({
        status: 'fail',
        message: ' Email cannot send due to server issue',
        error,
      });
    } else {
      return res.status(400).json({
        status: 'fail',
        message: ' Inserted data already exists or is not correct',
        error,
      });
    }
  }
};

/*
@Login:
    Description:                      user will login using email and password.
    Function_getEmailFromDb:          will run select query and return email entered by user.
    Variable_results:                 will store result of select query.
    Conditionals:                     1) first if statement will check email provided by the user doest not exists in the database.
                                      2) second if condition will check if password provided by the user matches with the password in the database.
                                      3) else will run in the best case scenario which will generate token and sent it via headers.
    Function_generateToken():         will generate encrpyted token using jwt token and sent it via headers
    Catch:                            will catch error if something else than above mentioned scenario occurs
*/

const login = async (req, res) => {
  try {
    logger.info('login');
    const { email, password } = req.body;

    const [results] = await getEmailFromDb(email);

    // logger.info(results);

    if (results.length === 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'email does not found, please register with your email',
      });
    }

    if (!results || !(await bcrypt.compare(password, results[0].password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Password is incorrect: please enter correct password',
      });
    } else {
      const id = results[0].id;
      const payload = {
        id,
        email,
      };

      const token = generateToken(payload);

      // logger.info("the token has been generated " + token);

      const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
        ), //converted into milli sec
        httpOnly: true,
      };

      res.cookie('userRegistered', token, cookieOptions);
      res.set('Authorization', `bearer ${token}`);
      res.set('Access-Control-Expose-Headers', 'Authorization');

      return res.status(200).json({
        token,
        status: 'success',
        message: 'User has been logged in',
      });
    }
  } catch (error) {
    // logger.error(error);

    return res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

/*
@Get_Password_Link_Via_Email:
    Description:                      user can reset password by providing registered email and user will receive email with token to verify identity. 
    Function_getEmailFromDb:          will run select query and return email entered by user.
    Variable_results:                 will store result of select query.
    Conditionals:                     1) first if statement will check email provided by the user doest not exists in the database.
                                      2) else will run in the best case scenario which will generate token and sent it via headers.
                                      3) third if statement will check if email is sent successfully to the user or not.
    Function_generateToken():         will generate encrpyted token using jwt token and sent it via headers
    Function_resetPasswordMail():     will sent reset password token to the user which include information like email address which is used to verify user in the database.
    Catch:                            will catch error if something else happend other than above mentioned scenarios.
*/

const getPasswordLink = async (req, res) => {
  logger.info('send Link');

  const { email } = req.body;
  try {
    const [results] = await getEmailFromDb(email); // getting email from db

    // logger.info("results[0]", results[0]);

    if (results.length === 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'email does not found, please register with your email',
      });
    } else {
      const payload = {
        email,
      };

      const token = generateToken(payload);

      const sent = await sendMail.sendPasswordResetMail(email, token);

      // logger.info(sent.accepted);
      // logger.info(sent.response);

      let emailResponse = sent.response;
      let emailSuccessResponse = '250';

      if (
        sent.accepted[0] === email &&
        emailResponse.substring(0, 3) === emailSuccessResponse
      ) {
        return res.status(200).json({
          status: 'success',
          message: 'password reset link sent successfully',
        });
      }
    }
  } catch (error) {
    // logger.error(error);

    return res.status(400).json({ status: 'fail', message: error });
  }
};

/*
@Reset_Password:
    Description:                      user can reset password by providing registered email and user will receive email with token to verify identity. 
    Function_decryptedPayload():      will take encrypted token and decrypted it to extract email.
    Function.getEmailFromDb():        will take email address from decrypted token and will match it with email in the database.
    Conditionals:                     1) first if statement (results.length === 0) will check email provided by the user doest not exists in the database.
                                      2) second if statement (token_result.length > 0) will check if token is already used.
                                      3) third condition will check if the password is updated if yes it will change rows.Affected to 1.
                                      4) foruth if statement (passwordAlreadyExists === true) will check if user entered same password or new password. If it enter same password system will ask user to enter new password.
    Function_getTokenFromDb()         will run select query to see where token and email is already present if they already exists than it will show error token is already used.
    Function_insertTokenInDb()        will insert password reset token to database with email address which will be used by getTokenFromDb() to verify token exist in the database.
    Function_jwt.Verify():            1) Best Case Scenario: checks if email exists in the database and update it.
                                      2) Worst Case Scenario: email doest not exist and throws error.
    Function_updatePassword():        will run update query to update password after satisfying all above mentioned conditions.
    Function_sendPasswordUpdatedMail  will send email to user after new password is set.
    Catch:                            will catch error if something else happend other than above mentioned scenarios.
*/

const resetPassword = async (req, res) => {
  try {
    logger.info('reset password router');
    let { token, password } = req.body;

    const secretKey = process.env.secretKey;

    const decryptedData = await decryptedPayload(token);

    // logger.info("decrypted data", decryptedData);
    // logger.info("decryted email", decryptedData.email);

    const [results] = await getEmailFromDb(decryptedData.email);

    // logger.info(results);

    if (results.length === 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'email does not found, please register with your email',
      });
    }

    // logger.info("db email", results[0].email);

    const [token_result] = await getTokenFromDb(token, results[0].email);

    if (token_result.length > 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'Token is already used',
      });
    }

    let passwordAlreadyExists = await bcrypt.compare(
      password,
      results[0].password
    );

    if (passwordAlreadyExists === true) {
      return res.status(200).json({
        status: 'fail',
        message:
          'Password Already Exists! Please enter new password to secure your account',
      });
    }

    jwt.verify(token, secretKey, async err => {
      if (!err) {
        if (results[0].email === decryptedData.email) {
          const [rows] = await updatePassword(results[0].email, password);

          // logger.info(rows);

          if (rows.affectedRows === 1) {
            const sent = await sendMail.sendPasswordUpdatedMail(
              results[0].email
            );

            let emailResponse = sent.response;
            let emailSuccessResponse = '250';

            if (
              sent.accepted[0] === results[0].email &&
              emailResponse.substring(0, 3) === emailSuccessResponse
            ) {
              await insertTokenInDb(token, results[0].email);

              return res.status(200).json({
                status: 'success',
                message: 'Password is updated please login using new password',
                decryptedData,
              });
            }
          }
        }
      }
    });
  } catch (error) {
    // logger.error(error);

    return res.status(400).json({
      status: 'fail',
      message: 'Your link has been expired',
      error,
    });
  }
};

const userProfile = async (req, res) => {
  const secretKey = process.env.secretKey;
  const token = req.token;

  try {
    const decryptedData = await decryptedPayload(token);

    // logger.info(decryptedData);

    jwt.verify(token, secretKey, err => {
      if (!err) {
        return res.status(200).json({
          status: 'success',
          message: 'token is valid',
          decryptedData,
        });
      }
    });
  } catch (error) {
    // logger.error(error);

    res.status(200).json({ status: 'fail', message: 'invalid token' });
  }
};

const logout = (req, res) => {
  res.cookie('userRegistered', 'logout', {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });

  return res.status(200).json({
    status: 'success',
    message: 'logged out succesfully',
  });
};

module.exports = {
  signup,
  login,
  userProfile,
  logout,
  getPasswordLink,
  resetPassword,
};
