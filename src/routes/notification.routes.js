const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
    sendTestNotification,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
} = require("../controllers/notification.controller");

router.get("/", authMiddleware, getNotifications);
router.post("/test", authMiddleware, sendTestNotification);
router.patch("/read-all", authMiddleware, markAllNotificationsRead);
router.patch("/:id/read", authMiddleware, markNotificationRead);
router.delete("/:id", authMiddleware, deleteNotification);

module.exports = router;
