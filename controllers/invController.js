const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildInventoryDetail = async function (req, res, next) {
  try {
    const invId = req.params.invId;
    const vehicleData = await invModel.getVehicleById(invId);
    const nav = await utilities.getNav();
    const detailHtml = utilities.buildVehicleDetail(vehicleData);
    res.render('inventory/vehicle-detail', {
  title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
  nav,
  vehicle: vehicleData,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = invCont;
