// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const validate = require("../utilities/account-validation");
const utilities = require("../utilities");
const asyncHandler = require("express-async-handler");

//  Classification view route
router.get("/type/:classificationId", invController.buildByClassificationId);

//  Inventory detail view
router.get("/detail/:invId", invController.buildInventoryDetail);
router.get('/', invController.buildInventoryManagement);

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));


// Management view

// Add classification
router.get("/classification/add", asyncHandler(invController.buildAddClassificationView));
router.post("/classification/add", validate.classificationName, asyncHandler(invController.addClassification));

// Add vehicle
router.get("/vehicle/add", asyncHandler(invController.buildAddInventory));
router.post("/vehicle/add", validate.inventoryFields, asyncHandler(invController.addInventory));

// Route to build edit inventory view
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView));

router.post("/edit/:update", validate.inventoryFields, asyncHandler(invController.updateInventory));


// GET - Show delete confirmation page
router.get("/delete/:inv_id", invController.buildDeleteView);

// POST - Handle delete request
router.post("/delete", invController.deleteInventoryItem);


module.exports = router;
