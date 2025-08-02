const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");

// Route to trigger a 500 error intentionally
router.get("/cause-error", testController.triggerError);

module.exports = router;
