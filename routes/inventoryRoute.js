// Needed Resources 
const express = require("express");
const router = new express.Router();

// Controller Imports

const invController = require("../controllers/invController");
const accountController = require("../controllers/accountController");
const errorController = require("../controllers/errorController");


// Validation Imports
const validate = require("../utilities/account-validation");
const utilities = require("../utilities");
const asyncHandler = require("express-async-handler");

// Middleware Imports
const { checkEmployee, checkLogin } = require("../utilities/index");

// 1. Classification View Route
// This route allows you to view inventory items by classification
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// 2. Inventory Detail View
// This route renders the detail page for a specific inventory item
router.get("/detail/:invId", asyncHandler(invController.buildInventoryDetail));

router.get("/detail/:invId", utilities.handleErrors(invController.buildInventoryDetail));

router.get("/cause-error", errorController.triggerError);

// 3. Inventory Management Page
router.get('/inv/management',  asyncHandler(invController.buildInventoryManagement));



// Route to manage inventory items, restricted to employees/admins
router.get("/", asyncHandler(invController.buildInventoryManagement));

router.get('/getInventory/:classification_id', utilities.handleErrors(invController.getInventoryJSON));



router.get("/classification/add",  asyncHandler(invController.buildAddClassificationView));
router.post("/classification/add", validate.classificationName, asyncHandler(invController.addClassification));


router.get("/vehicle/add",  asyncHandler(invController.buildAddInventory));
router.post("/vehicle/add", validate.inventoryFields, asyncHandler(invController.addInventory));


router.get("/edit/:inv_id",  asyncHandler(invController.editInventoryView));
router.post("/edit/:inv_id",  validate.inventoryFields, asyncHandler(invController.updateInventory));


router.get("/delete/:inv_id",  asyncHandler(invController.buildDeleteView));
router.post("/delete",  asyncHandler(invController.deleteInventoryItem));



module.exports = router;
