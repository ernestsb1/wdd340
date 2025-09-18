function handleErrors(err, req, res, next) {
  console.error("Error:", err.stack || err.message);
  const status = err.status || 500;
  res.status(status).render("errors/error", {
    title: `${status} Error`,
    message: err.message || "Internal Server Error",
    nav: res.locals.nav || "", 
  });
}

module.exports = handleErrors;
