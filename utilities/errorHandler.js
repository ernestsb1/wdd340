// /utilities/errorHandler.js
module.exports = function (err, req, res, next) {
  // Log the error for debugging purposes
  console.error(err.stack);

  // Set the status code; if it's not provided, default to 500
  const status = err.status || 500;

  // Set the error message; if not provided, default to a generic message
  const message = err.message || 'Something went wrong!';

  // Pass status and message to the view
  res.status(status).render('error', {
    status: status,
    message: message
  });
};
