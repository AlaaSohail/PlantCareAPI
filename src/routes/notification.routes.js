const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middleware/auth.middleware");

const {
  sendTestNotification,
} = require("../controllers/notification.controller");

router.post(
  "/test",
  authMiddleware,
  sendTestNotification
);

module.exports = router;