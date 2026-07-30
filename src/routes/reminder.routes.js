const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/auth.middleware");


const {

    createReminder,

    getReminders,

    completeReminder,

    deleteReminder,
    updateReminder

} = require("../controllers/reminder.controller");



// Create reminder for plant
router.post(
    "/plants/:id/reminders",
    authMiddleware,
    createReminder
);



// Get plant reminders
router.get(
    "/plants/:id/reminders",
    authMiddleware,
    getReminders
);



// Complete reminder
router.put(
    "/reminders/:id/complete",
    authMiddleware,
    completeReminder
);



// Delete reminder
router.delete(
    "/reminders/:id",
    authMiddleware,
    deleteReminder
);

router.put(
    "/reminders/:id",
    authMiddleware,
    updateReminder
);

module.exports = router;