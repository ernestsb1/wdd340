// controllers/testController.js

exports.triggerError = (req, res, next) => {
  // This will intentionally trigger a 500 error
  const err = new Error("This is an intentional 500 error.");
  err.status = 500;
  next(err); // Or: next(err);
};
