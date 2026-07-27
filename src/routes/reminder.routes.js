const express = require("express");

const router = express.Router();


const authMiddleware =
    require("../middleware/auth.middleware");


const {

    createReminder,
    getReminders

} = require("../controllers/reminder.controller");



router.post(

    "/plants/:id/reminders",

    authMiddleware,

    createReminder

);



router.get(

    "/reminders",

    authMiddleware,

    getReminders

);



module.exports = router;