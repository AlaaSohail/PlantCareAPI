const cron = require("node-cron");

const Reminder =
    require("../models/reminder.model");

const {
    getNextDate
} = require("../utils/reminder.utils");


cron.schedule("* * * * *", async () => {

    try {

        const reminders =
            await Reminder.findPending();


        if (reminders.length === 0) {
            return;
        }


        console.log(
            `🔔 ${reminders.length} reminder(s) ready`
        );


        for (const reminder of reminders) {

            console.log({
                id: reminder.id,
                title: reminder.title,
                type: reminder.type,
                repeat: reminder.repeat_type,
                date: reminder.reminder_date
            });


            if (
                reminder.repeat_type === "daily" ||
                reminder.repeat_type === "weekly" ||
                reminder.repeat_type === "monthly"
            ) {

                const nextDate =
                    getNextDate(
                        reminder.reminder_date,
                        reminder.repeat_type
                    );


                await Reminder.updateNextDate(
                    reminder.id,
                    nextDate
                );


                console.log(
                    "🔄 Reminder rescheduled:",
                    nextDate
                );

            } else {

                await Reminder.markCompleted(
                    reminder.id
                );


                console.log(
                    "✅ Reminder completed:",
                    reminder.id
                );

            }

        }

    } catch (error) {

        console.log(
            "Reminder Job Error:",
            error.message
        );

    }

});