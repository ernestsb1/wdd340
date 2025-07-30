const utilities = require("../utilities");
const baseController = {};

baseController.buildHome = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("index", { title: "Home", nav });
  } catch (err) {
    next(err); // Important to pass errors to your global error handler
  }
};

module.exports = baseController;
