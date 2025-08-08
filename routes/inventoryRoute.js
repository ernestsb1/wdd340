// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const validate = require("../utilities/account-validation");
const asyncHandler = require("express-async-handler");

//  Classification view route
router.get("/type/:classificationId", invController.buildByClassificationId);

//  Inventory detail view
router.get("/detail/:invId", invController.buildInventoryDetail);
router.get('/', invController.buildInventoryManagement);

// Management view

// Add classification
router.get("/classification/add", asyncHandler(invController.buildAddClassificationView));
router.post("/classification/add", validate.classificationName, asyncHandler(invController.addClassification));

// Add vehicle
router.get("/vehicle/add", asyncHandler(invController.buildAddInventory));
router.post("/vehicle/add", validate.inventoryFields, asyncHandler(invController.addInventory));

module.exports = router;
