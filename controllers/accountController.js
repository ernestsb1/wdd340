const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const { validationResult } = require("express-validator");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  const nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    messages: req.flash(),
    errors: res.locals.errors || null,
    account_email: req.body?.account_email || "",
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  const nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    hashedPassword = bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.");
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  try {
    const regResult = await accountModel.registerAccount(account_firstname, account_lastname, account_email, hashedPassword);

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.redirect("/account/login");
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.redirect("/account/register");
    }
  } catch (error) {
    console.error("Registration Error:", error);
    req.flash("notice", "An unexpected error occurred. Please try again.");
    return res.redirect("/account/register");
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }

  try {
    const match = await bcrypt.compare(account_password, accountData.account_password);
    if (match) {
      delete accountData.account_password;

      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 3600,
      });

      const cookieOptions = {
        httpOnly: true,
        maxAge: 3600 * 1000,
      };

      if (process.env.NODE_ENV !== "development") {
        cookieOptions.secure = true;
      }

      res.cookie("jwt", accessToken, cookieOptions);
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    req.flash("notice", "An error occurred during login. Please try again.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }
}

/* ****************************************
 *  Build Account Management View
 * ************************************ */
async function buildAccountManagement(req, res) {
  const nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    messages: req.flash('notice')
  });
}



/* ****************************************
 * Show Account Update View
 * ************************************ */
async function showAccountUpdateView(req, res) {
  const accountId = req.params.account_id;

  try {
    const account = await accountModel.getAccountById(accountId);
    const nav = await utilities.getNav();

    // Optional: define errors and error variables (could come from validation or other logic)
    const errors = []; // or retrieve from validationResult(req).array()
    const error = null; // or get from somewhere else
res.render("account/update", {
  title: "Update Account",
  nav,
  accountData: account,
  account_id: account.account_id,
  messages: req.flash(),
  errors: [],
  error: null
});

    
  } catch (err) {
    console.error("Error fetching account by ID:", err);
    res.status(500).send("Error fetching account data");
  }
}

/* ****************************************
 * Update Account Information
 * ************************************ */
async function accountUpdate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('account/update', {
      title: 'Edit Account Information',
      nav: await utilities.getNav(),
      errors: errors.array(),
      messages: req.flash('notice'),
      accountData: req.body // Retain data in case of validation failure
    });
  }

  try {
    const { account_id, account_firstname, account_lastname, account_email } = req.body;

    // Check if the email is already used
    const existingAccount = await accountModel.getAccountByEmail(account_email);
    if (existingAccount && existingAccount.account_id !== account_id) {
      return res.render('account/update', {
        title: 'Edit Account Information',
        nav: await utilities.getNav(),
        errors: null,
        messages: req.flash('notice'),
        error: 'Email is already taken by another account.',
        accountData: req.body
      });
    }

    // Update account information in the database
    await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email);

    req.flash("notice", "Account successfully updated.");
    res.redirect('/account/management');
  } catch (error) {
    console.error(error);
    req.flash("notice", "An error occurred while updating account information.");
    res.status(500).render('error', { message: 'An error occurred while updating account information.' });
  }
}

/* ****************************************
 * Change Password
 * ************************************ */
async function accountPasswordUpdate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('account/update', {
      title: 'Edit Account Information',
      nav: await utilities.getNav(),
      errors: errors.array(),
      messages: req.flash('notice'),
      accountData: req.body
    });
  }

  try {
    const { account_id, account_password } = req.body;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(account_password, 10);

    // Update password in the database
    await accountModel.updatePassword(account_id, hashedPassword);

    req.flash("notice", "Password successfully updated.");
    res.redirect('/account/management');
  } catch (error) {
    console.error(error);
    req.flash("notice", "An error occurred while changing password.");
    res.status(500).render('error', { message: 'An error occurred while changing password.' });
  }
}

/* ****************************************
 * Logout
 * ************************************ */
async function logout(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
}

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildAccountManagement, 
  showAccountUpdateView, 
  accountPasswordUpdate, 
  accountUpdate, 
  logout 
};
