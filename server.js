/******************************************
 * server.js - Main entry point for the app
 ******************************************/

/* =======================
 *  Module Imports
 * ======================= */
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");
const {pool} = require('./database/');
require("dotenv").config();
const utilities = require("./utilities");

/* =======================
 *  Custom Module Imports
 * ======================= */
const accountRoute = require("./routes/accountRoute");
const staticRoutes = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");

/* =======================
 *  App Initialization
 * ======================= */
const app = express();

/* =======================
 *  Middleware
 * ======================= */
app.get('/someRoute', (req, res, next) => {
  const err = new Error('This is a custom error');
  err.status = 400;  // Optional, you can set any custom status code
  next(err); // Pass the error to the next middleware
});

// Global nav injection middleware
app.use((req, res, next) => {
  res.locals.nav = utilities.getNav();
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});



// Session middleware with Postgres session store
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));

// Flash messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(cookieParser());
app.use(utilities.checkJWTToken);

// Static files middleware
app.use(express.static("public")); // Serve static assets

/* =======================
 *  View Engine Setup
 * ======================= */
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Relative to views/

/* =======================
 *  Routing
 * ======================= */

// Account routes
app.use("/account", accountRoute);

// Home route
app.get("/", baseController.buildHome);

// Other routes
app.use("/inv", inventoryRoute);
app.use("/", staticRoutes);

/* =======================
 *  Error Handling
 * ======================= */

// 404 handler
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' })
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message: err.message,
    status: err.status || 500,  
    nav
  })
})

/* =======================
 *  Start Server
 * ======================= */
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});
