const cron = require("node-cron");
const Reminder = require("../models/reminder.model");
const Notification = require("../models/notification.model");
const { getNextDate } = require("../utils/reminder.utils");
const { sendNotificationToUser } = require("../services/notification.service");

let running = false;

const processReminders = async () => {
    if (running) return;
    running = true;

    try {
        const reminders = await Reminder.findPending();

        for (const reminder of reminders) {
            const occurrenceKey = new Date(reminder.reminder_date).toISOString();
            const dedupeKey = `reminder:${reminder.id}:${occurrenceKey}`;
            const title = reminder.title || "Plant care reminder 🌱";
            const message =
                reminder.description ||
                `It's time to care for ${reminder.plant_name || "your plant"}.`;

            await Notification.create({
                user_id: reminder.user_id,
                plant_id: reminder.plant_id,
                title,
                message,
                type: "reminder",
                dedupe_key: dedupeKey,
                data: {
                    reminderId: reminder.id,
                    plantId: reminder.plant_id,
                    reminderType: reminder.type,
                },
            });

            if (
                reminder.notifications_enabled !== false &&
                reminder.task_notifications_enabled !== false &&
                reminder.fcm_token
            ) {
                try {
                    await sendNotificationToUser({
                        userId: reminder.user_id,
                        token: reminder.fcm_token,
                        title,
                        body: message,
                        data: {
                            type: "reminder",
                            reminderId: reminder.id,
                            plantId: reminder.plant_id,
                        },
                    });
                } catch (error) {
                    console.error(
                        `REMINDER PUSH FAILED ${reminder.id}:`,
                        error.code || error.message
                    );
                }
            }

            if (["daily", "weekly", "monthly"].includes(reminder.repeat_type)) {
                const nextDate = getNextDate(
                    reminder.reminder_date,
                    reminder.repeat_type
                );
                await Reminder.rescheduleAfterNotification(reminder.id, nextDate);
            } else {
                await Reminder.completeOnceAfterNotification(reminder.id);
            }
        }
    } catch (error) {
        console.error("REMINDER JOB ERROR:", error);
    } finally {
        running = false;
    }
};

if (process.env.DISABLE_INTERNAL_CRON !== "true") {
    cron.schedule("* * * * *", processReminders);
}

module.exports = {
    processReminders,
};
