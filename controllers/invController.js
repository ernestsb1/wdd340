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


invCont.buildManagementView = async (req, res) => {
  const nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: req.flash("message"),
    error: req.flash("error"),
  });
};

/* Add classification GET */
invCont.buildAddClassificationView = async (req, res) => {
  const nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    message: req.flash("message"),
    errors: req.flash("errors"),
  });
};

/* Add classification POST */
invCont.addClassification = async (req, res) => {
  const { classification_name } = req.body;
  const result = await invModel.addClassification(classification_name);
  if (result.rowCount === 1) {
    req.flash("message", "Classification added successfully.");
    return res.redirect("/inv"); // Go back to management
  } else {
    req.flash("errors", [{ msg: "Failed to add classification." }]);
    return res.redirect("/inv/classification/add");
  }
};

/* Add vehicle GET */
invCont.buildAddInventoryView = async (req, res) => {
  const nav = await utilities.getNav();
  const classList = await utilities.buildClassificationList();
  const formData = req.flash("formData")[0] || {};
  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classList,
    message: req.flash("message"),
    errors: req.flash("errors"),
    formData,
  });
};

/* Add vehicle POST */
invCont.addInventory = async (req, res) => {
  const vehicleData = req.body;
  const result = await invModel.addInventoryItem(vehicleData);
  if (result.rowCount === 1) {
    req.flash("message", "Vehicle added successfully.");
    return res.redirect("/inv");
  } else {
    req.flash("errors", [{ msg: "Failed to add vehicle." }]);
    req.flash("formData", vehicleData);
    return res.redirect("/inv/vehicle/add");
  }
};



module.exports = invCont;
