const express = require("express");
const router = new express.Router();
const testController = require("../controllers/testController");

// Route to trigger a 500 error intentionally
router.get("/error", testController.triggerError);

module.exports = router;
