const jwt = require("jsonwebtoken");
require("dotenv").config();
const invModel = require("../models/inventory-model");
const TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const Util = {};

/* ================================
 *         VIEW HELPERS
 * ================================ */

/** Navigation bar generator */
Util.getNav = async function () {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 *************************************** */
Util.buildClassificationGrid = async function (data) {
  let grid = "";
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid +=
      '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};


/** Build vehicle detail page */
Util.buildVehicleDetail = function (vehicle) {
  const formattedPrice = Number(vehicle.inv_price).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const formattedMiles = Number(vehicle.inv_miles).toLocaleString("en-US");

  return `
    <section class="vehicle-detail">
      <div class="vehicle-img">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      </div>
      <div class="vehicle-info">
        <h2>${vehicle.inv_make} ${vehicle.inv_model} (${vehicle.inv_year})</h2>
        <p><strong>Price:</strong> ${formattedPrice}</p>
        <p><strong>Mileage:</strong> ${formattedMiles} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      </div>
    </section>
  `;
};

/** Build classification dropdown */
Util.buildClassificationList = async function (selectedId = null) {
  const data = await invModel.getClassifications()
  let options = '<option value="">Choose a Classification</option>'

  data.rows.forEach(row => {
    options += `<option value="${row.classification_id}"${selectedId == row.classification_id ? " selected" : ""}>${row.classification_name}</option>`
  })

  return options
}

/* ================================
 *        GENERAL UTILITIES
 * ================================ */

/** Error-handling wrapper for controllers */
Util.handleErrors = function (fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/* ================================
 *       AUTHENTICATION MIDDLEWARE
 * ================================ */

/** Validates JWT if present and sets login state */
// JWT verification middleware
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    res.locals.loggedin = false;
    return next();
  }

  jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
    if (err) {
      req.flash("notice", "Please log in");
      res.clearCookie("jwt");
      return res.redirect("/account/login");
    }
    res.locals.accountData = decoded;
    res.locals.loggedin = true;
    next();
  });
};

// Role-based authorization middleware


Util.checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const token = req.cookies.jwt;

    // If no token, not logged in at all
    if (!token) {
      req.flash("notice", "Please log in first.");
      return res.redirect("/account/login");
    }

    try {
      const decoded = jwt.verify(token, TOKEN_SECRET);
      const userRole = decoded.account_type;

      // If role is not allowed (e.g. Client)
      if (!allowedRoles.includes(userRole)) {
        req.flash("notice", "Access denied.");
        return res.redirect("/account/login");
      }

      // Success — store user in locals for views
      res.locals.accountData = decoded;
      res.locals.loggedin = true;
      next();
    } catch (err) {
      console.error("JWT verification failed:", err);
      req.flash("notice", "Session expired. Please log in again.");
      res.clearCookie("jwt");
      return res.redirect("/account/login");
    }
  };
};


/** Ensures user is logged in */
Util.checkLogin = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash("notice", "You must be logged in to access this page.");
    return res.redirect("/account/login");
  }

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);
    res.locals.accountData = decoded;
    next();
  } catch (err) {
    req.flash("notice", "Session expired. Please log in again.");
    return res.redirect("/account/login");
  }
};

/** Ensures user is employee or admin */
Util.checkEmployee = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash("notice", "Not authorized.");
    return res.redirect("/account/login");
  }

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);
    if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
      res.locals.accountData = decoded;
      return next();
    } else {
      req.flash("notice", "You are not authorized to view this page.");
      return res.redirect("/account/login");
    }
  } catch (err) {
    req.flash("notice", "Authorization failed. Please log in again.");
    return res.redirect("/account/login");
  }
};

/** Helper to make `res.locals.loggedin` available in templates */
Util.checkLoginStatus = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, TOKEN_SECRET);
      res.locals.loggedin = true;
      res.locals.firstname = decoded.account_firstname;
    } catch {
      res.locals.loggedin = false;
    }
  } else {
    res.locals.loggedin = false;
  }
  next();
};

/** Check if user has specific account type access */
Util.checkAccountType = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    req.flash("notice", "Please log in to access this page.");
    return res.redirect("/account/login");
  }

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);

    // ✅ Allow only Admin or Employee
    if (decoded.account_type === "Admin" || decoded.account_type === "Employee") {
      res.locals.accountData = decoded;
      res.locals.loggedin = true;
      return next();
    }

    // ❌ Block Clients
    req.flash("notice", "Access denied: Clients cannot access this page.");
    return res.redirect("/account/login");
  } catch (err) {
    console.error("JWT verification failed:", err);
    req.flash("notice", "Session expired or invalid. Please log in again.");
    res.clearCookie("jwt");
    return res.redirect("/account/login");
  }
};


module.exports = Util;
