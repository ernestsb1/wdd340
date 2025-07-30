// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");

//  Classification view route
router.get("/type/:classificationId", invController.buildByClassificationId);

//  Inventory detail view
router.get("/detail/:invId", invController.buildInventoryDetail);

module.exports = router;
