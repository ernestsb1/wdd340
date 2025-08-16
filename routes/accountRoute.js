const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const invController = require('../controllers/invController'); // Adjust the path according to your file structure

const regValidate = require('../utilities/account-validation');
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const { checkLogin } = utilities; // Extracted for clarity

const validateAccountUpdate = regValidate.updateAccountRules();
const validatePassword = regValidate.passwordUpdateRules();

router.get("/update/:account_id", accountController.showAccountUpdateView)
// Post route for handling form submission with the account ID
router.post("/update", validateAccountUpdate, accountController.accountUpdate)
 
router.post("/update-password", validatePassword, accountController.accountPasswordUpdate)
// Password update routes
router.get("/update-password", checkLogin, utilities.handleErrors(accountController.showPasswordUpdateForm));

// Post route for updating the password
// inventoryRoutes.js
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));


// Auth-related views
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Account management dashboard
router.get("/", checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

// Registration handling
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Login handling
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Logout route (clears JWT cookie)
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  req.flash("notice", "You are logged out.");
  res.redirect("/");
});

module.exports = router;
