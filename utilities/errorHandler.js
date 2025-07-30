function handleErrors(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).render("error", {
    title: err.status === 404 ? "404 Not Found" : "Server Error",
    message: err.message || "Something went wrong"
  });
}

module.exports = handleErrors;
