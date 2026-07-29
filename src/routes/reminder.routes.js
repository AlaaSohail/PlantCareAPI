const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/auth.middleware");


const {

    createReminder,

    getReminders,

    completeReminder,

    deleteReminder

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



module.exports = router;