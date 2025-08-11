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
      title: `${className} vehicles`,
      nav,
      grid,
      message: req.flash("message"),
      errors: req.flash("errors"),
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
    res.render("inventory/vehicle-detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicle: vehicleData,
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Inventory Management View
 * ************************** */
invCont.buildInventoryManagement = async function (req, res) {
  try {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      inventoryList: [],
      message: req.flash("message"),
      errors: req.flash("errors")
    });
  } catch (error) {
    console.error("Error loading inventory management view:", error);
    const nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect: "",
      inventoryList: [],
      message: "Error loading inventory data.",
      errors: []
    });
  }
};

/* ***************************
 *  Add Classification GET
 * ************************** */
invCont.buildAddClassificationView = async (req, res) => {
  const nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    message: req.flash("message"),
    errors: req.flash("errors"),
  });
};

/* ***************************
 *  Add Classification POST
 * ************************** */
invCont.addClassification = async (req, res) => {
  const { classification_name } = req.body;
  try {
    const result = await invModel.addClassification(classification_name);

    if (result.rowCount === 1) {
      req.flash("message", "Classification added successfully.");
      return res.redirect("/inv");
    } else {
      req.flash("errors", [{ msg: "Failed to add classification." }]);
      return res.redirect("/inv/classification/add");
    }
  } catch (error) {
    console.error("Error adding classification:", error);
    req.flash("errors", [{ msg: "An error occurred while adding classification." }]);
    return res.redirect("/inv/classification/add");
  }
};

/* ***************************
 *  Add Vehicle GET
 * ************************** */
invCont.buildAddInventory = async (req, res) => {
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

/* ***************************
 *  Add Vehicle POST
 * ************************** */
invCont.addInventory = async (req, res) => {
  const vehicleData = req.body;

  try {
    const result = await invModel.addInventoryItem(vehicleData);
    if (result.rowCount === 1) {
      req.flash("message", "Vehicle added successfully.");
      return res.redirect("/inv");
    } else {
      throw new Error("Failed to add vehicle");
    }
  } catch (error) {
    console.error("Error adding vehicle:", error);
    req.flash("errors", [{ msg: "Failed to add vehicle." }]);
    req.flash("formData", vehicleData);
    return res.redirect("/inv/vehicle/add");
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);
  if (invData.length > 0 && invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);

    // Check if item exists
    if (!itemData || !itemData.inv_id) {
      throw new Error("Vehicle not found.");
    }

    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("inventory/edit-inventory", {
      title: `Edit ${itemName}`,
      nav,
      classificationSelect,
      errors: req.flash("errors"),
  message: req.flash("message"),
  ...itemData,
    });
  } catch (error) {
    console.error("Error building edit-inventory view:", error);
    next(error);
  }
};

invCont.updateInventory = async function (req, res) {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  } = req.body;

  try {
    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    );

    if (updateResult) {
      req.flash("message", `${inv_make} ${inv_model} was successfully updated.`);
      return res.redirect("/inv");
    } else {
      req.flash("errors", [{ msg: "Update failed. Try again." }]);
      return res.redirect(`/inv/edit/${inv_id}`);
    }
  } catch (error) {
    console.error("Update error:", error);
    req.flash("errors", [{ msg: "An error occurred during update." }]);
    return res.redirect(`/inv/edit/${inv_id}`);
  }
};



/* ***************************
 *  Update Inventory Controller
 * ************************** */


module.exports = invCont;
