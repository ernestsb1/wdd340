/******************************************
 * server.js - Main entry point for the app
 ******************************************/

/* =======================
 *  Module Imports
 ======================= */
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();
const app = express();

/* =======================
 * Custom Module Imports
 ======================= */
 const testRoutes = require('./routes/testRoutes');
const errorHandler = require("./utilities/errorHandler");
const staticRoutes = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");



/* =======================
 *  App Configuration
 ======================= */
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Relative to views/
app.use(express.static("public"));     // Serve static assets

/* =======================
 * 4. Routing
 ======================= */

app.get("/", baseController.buildHome);

// Mount other routes
app.use("/inv", inventoryRoute);
app.use("/", staticRoutes);
app.use('/', testRoutes); 


/* =======================
 *  Error Handling
 ======================= */
// 404 Not Found Handler
app.use((req, res, next) => {
  const err = new Error("Page Not Found");
  err.status = 404;
  next(err);
});

// Global Error Handler
app.use(errorHandler);

/* =======================
 *  Start Server
 ======================= */
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});
