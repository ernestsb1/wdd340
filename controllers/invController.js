const invModel = require("../models/inventory-model")
const utilities = require('../utilities/index');

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}



invCont.buildInventoryDetail = async function(req, res) {
  try {
    const invId = req.params.invId;
    const vehicle = await invModel.getInventoryItem(invId);
    res.render('inventory/detail', { vehicle });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error retrieving inventory item details' });
  }
};


module.exports = invCont
