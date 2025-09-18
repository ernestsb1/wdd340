const errorController = {};

errorController.triggerError = (req, res, next) => {
  const error = new Error("Intentional server error triggered from controller.");
  error.status = 500;
  throw error; // properly pass to middleware
};


module.exports = errorController;
