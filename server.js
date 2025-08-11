/******************************************
 * server.js - Main entry point for the app
 ******************************************/

/* =======================
 *  Module Imports
 * ======================= */
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
const expressLayouts = require("express-ejs-layouts");
const pool = require('./database/');
require("dotenv").config();
const utilities = require("./utilities");

/* =======================
 *  Custom Module Imports
 * ======================= */
const accountRoute = require("./routes/accountRoute");
const testRoutes = require('./routes/testRoutes');
const errorHandler = require("./utilities/errorHandler");
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

// Body parser middleware to handle form submissions and JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser())
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
app.use('/', testRoutes);

/* =======================
 *  Error Handling
 * ======================= */

// 404 Not Found handler
app.use((req, res, next) => {
  const err = new Error("Page Not Found");
  err.status = 404;
  next(err);
});
// Global error handler
app.use(errorHandler);



/* =======================
 *  Start Server
 * ======================= */
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});
