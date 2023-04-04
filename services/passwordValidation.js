const passwordValidator = require("password-validator");
const password_schema = new passwordValidator();
password_schema
  .is()
  .min(8) // Minimum length 8
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(); // Must have digits

module.exports = password_schema;

