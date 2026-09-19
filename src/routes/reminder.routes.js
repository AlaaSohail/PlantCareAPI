const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
    createReminder,
    getReminders,
    completeReminder,
    deleteReminder,
    updateReminder,
    createCarePlan,
} = require("../controllers/reminder.controller");

router.post("/plants/:plantId/reminders", authMiddleware, createReminder);
router.get("/plants/:plantId/reminders", authMiddleware, getReminders);
router.put(
    "/plants/:plantId/reminders/:reminderId/complete",
    authMiddleware,
    completeReminder
);
router.delete(
    "/plants/:plantId/reminders/:reminderId",
    authMiddleware,
    deleteReminder
);
router.put(
    "/plants/:plantId/reminders/:reminderId",
    authMiddleware,
    updateReminder
);
router.post("/plants/:plantId/care-plan", authMiddleware, createCarePlan);

module.exports = router;
