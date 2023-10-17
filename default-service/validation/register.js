const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};
  // Convert empty fields to an empty string so we can use validator functions
  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";
  // Name checks
  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }

  // Email checks
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }
  var format = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;
  // Password checks
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  } else if (
    !Validator.isLength(data.password, { min: 8, max: 30 }) ||
    Validator.equals(data.password, data.password.toLowerCase()) ||
    !format.test(data.password)
  ) {
    errors.password =
      "Password must be at least 8 characters, contain 1 symbol, and 1 capital letter.";
  }

  if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm password field is required";
  } else if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
};
