function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).render("error", {
    title: "Error",
    message: err.message,
    status: status,
    nav: ""
  });
}

module.exports = errorHandler;
