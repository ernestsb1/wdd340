// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// Route to build inventory detail view
//router.get("/inv/detail/:invId", invController.buildInventoryDetail);
router.get("/inv/detail/:invId", invController.buildInventoryDetail);

const invModel = require('../models/inventory-model');

router.get('/inv/detail/:invId', async (req, res) => {
  const invId = req.params.invId;
  try {
    const vehicle = await invModel.getInventoryItem(invId);
    if (!vehicle) {
      res.status(404).send('Inventory item not found');
    } else {
      res.render('inventory/detail', { vehicle });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving inventory item');
  }
});



module.exports = router;

