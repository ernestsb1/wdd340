const accountModel = require("../models/account-model");
const utilities = require(".");
const { body, validationResult } = require("express-validator");
const { check } = require("express-validator");

// Define the route for account update
const validate = {};

/* **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (email) => {
        const emailExists = await accountModel.checkExistingEmail(email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.");
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters long and contain uppercase, lowercase, numbers, and symbols."),
  ];
};

/* **********************************
 *  Login Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required."),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password must be at least 12 characters long."),
  ];
};

/* **********************************
 *  Check registration validation results
 * ********************************* */
validate.checkRegData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      errors: errors.array(),
      account_firstname: req.body.account_firstname || "",
      account_lastname: req.body.account_lastname || "",
      account_email: req.body.account_email || "",
    });
  }
  next();
};

/* **********************************
 *  Check login validation results
 * ********************************* */
validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email: req.body.account_email || "",
    });
  }
  next();
};

/* **********************************
 *  Classification Name Validation
 * ********************************* */
validate.classificationName = (req, res, next) => {
  const name = req.body.classification_name;
  const errors = [];
  if (!name || !/^[A-Za-z0-9]+$/.test(name)) {
    errors.push({ msg: 'Classification name must contain only letters and digits (no spaces/special characters).' });
  }
  if (errors.length) {
    req.flash('errors', errors);
    return res.redirect('/inv/classification/add');
  }
  next();
};

/* **********************************
 *  Inventory Fields Validation
 * ********************************* */
validate.inventoryFields = (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id } = req.body;
  const errors = [];

  if (!inv_make || !inv_model || !inv_description || !inv_color) {
    errors.push('All text fields (Make, Model, Description, Color) are required.');
  }

  if (!inv_year || inv_year < 1900 || inv_year > new Date().getFullYear()) {
    errors.push('Year must be a realistic value (between 1900 and current year).');
  }

  if (!inv_price || inv_price <= 0) {
    errors.push('Price must be a positive value.');
  }

  if (!inv_miles || inv_miles < 0) {
    errors.push('Miles cannot be negative.');
  }

  if (!classification_id) {
    errors.push('You must select a classification.');
  }

  if (errors.length) {
    req.flash('errors', errors);
    req.flash('body', req.body);  // Ensure the form data is reloaded
    return res.redirect('/inv/vehicle/add');
  }
  next();
};

/* **********************************
 *  Check Add Inventory Validation Results
 * ********************************* */
validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(req.body.classification_id);
    return res.status(400).render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationSelect,
      errors: errors.array(),
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id
    });
  }
  next();
};


/* **********************************
 *  Update Inventory Data Validation
 * ********************************* */
validate.checkUpdateData = (req, res, next) => {
  const { inv_id, inv_make, inv_model, inv_year, inv_description } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const classificationSelect = utilities.buildClassificationList(req.body.classification_id);
    res.render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav: res.locals.nav,
      classificationSelect,
      errors: errors.array(),
      inv_id, inv_make, inv_model, inv_year, inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id
    });
    return;
  }
  next();
};

/* **********************************
 *  Update Account Info Validation Rules
 * ********************************* */
validate.updateAccountRules = () => {
  return [
    body("account_firstname").trim().notEmpty().withMessage("First name is required."),
    body("account_lastname").trim().notEmpty().withMessage("Last name is required."),
    body("account_email").isEmail().normalizeEmail().withMessage("A valid email is required."),
    body("account_id").notEmpty().withMessage("Account ID is required."),

  ];
};

/* **********************************
 *  Password Update Validation Rules
 * ********************************* */
validate.passwordUpdateRules = () => {
  return [
    body("account_password")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters long and contain uppercase, lowercase, numbers, and symbols."),
  ];
};

/* **********************************
 *  Server-Side Email Uniqueness Check
 * ********************************* */
validate.validateEmail = async (email) => {
  const sql = 'SELECT * FROM account WHERE email = $1';
  const result = await pool.query(sql, [email]);
  if (result.rows.length > 0) throw new Error('Email already in use');
};





module.exports = validate;
