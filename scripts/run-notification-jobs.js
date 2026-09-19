require("dotenv").config();
process.env.DISABLE_INTERNAL_CRON = "true";

const db = require("../src/config/database");
const { processReminders } = require("../src/jobs/reminder.job");
const { processTaskNotifications } = require("../src/jobs/taskNotification.job");
const { processWeatherAlerts } = require("../src/jobs/weatherAlert.job");

const run = async () => {
    try {
        await processReminders();
        await processTaskNotifications();
        await processWeatherAlerts();
        console.log("✅ Notification jobs completed");
        await db.end();
        process.exit(0);
    } catch (error) {
        console.error("❌ Notification jobs failed:", error);
        await db.end();
        process.exit(1);
    }
};

run();
