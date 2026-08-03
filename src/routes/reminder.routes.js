const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/auth.middleware");


const {

    createReminder,

    getReminders,

    completeReminder,

    deleteReminder,

    updateReminder,

    createCarePlan

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
    "/plants/:id/reminders/:id/complete",
    authMiddleware,
    completeReminder
);



// Delete reminder
router.delete(
    "/plants/:id/reminders/:id",
    authMiddleware,
    deleteReminder
);

router.put(
    "/plants/:id/reminders/:id",
    authMiddleware,
    updateReminder
);
router.post(

    "/plants/:plantId/care-plan",

    authMiddleware,

    createCarePlan

);

module.exports = router;