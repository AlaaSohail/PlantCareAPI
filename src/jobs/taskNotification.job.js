const cron = require("node-cron");
const Task = require("../models/task.model");
const Notification = require("../models/notification.model");
const { sendNotificationToUser } = require("../services/notification.service");

let running = false;

const taskTypeLabel = (type) => {
    const labels = {
        watering: "Watering time 💧",
        fertilizer: "Fertilizer reminder 🌿",
        sunlight: "Sunlight reminder ☀️",
        health_check: "Plant health check 🌱",
        pruning: "Pruning reminder ✂️",
        misting: "Misting reminder 💦",
        custom: "Plant care reminder 🌱",
    };
    return labels[type] || "Plant care reminder 🌱";
};

const toDateString = (value) => {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.slice(0, 10);
    }

    const date = new Date(value);
    return date.toISOString().slice(0, 10);
};

const processTaskNotifications = async () => {
    if (running) return;
    running = true;

    try {
        const tasks = await Task.findDueNotifications();

        for (const task of tasks) {
            const title = taskTypeLabel(task.task_type);
            const body =
                task.description ||
                `${task.title}${task.plant_name ? ` — ${task.plant_name}` : ""}`;
            const dueDate = toDateString(task.next_due_date);
            const dedupeKey = `task:${task.id}:${dueDate}`;

            await Notification.create({
                user_id: task.user_id,
                plant_id: task.plant_id,
                title,
                message: body,
                type: "task",
                dedupe_key: dedupeKey,
                data: {
                    taskId: task.id,
                    plantId: task.plant_id,
                    taskType: task.task_type,
                    dueDate,
                },
            });

            if (
                task.notifications_enabled !== false &&
                task.task_notifications_enabled !== false &&
                task.fcm_token
            ) {
                try {
                    await sendNotificationToUser({
                        userId: task.user_id,
                        token: task.fcm_token,
                        title,
                        body,
                        data: {
                            type: "task",
                            taskId: task.id,
                            plantId: task.plant_id,
                            taskType: task.task_type,
                        },
                    });
                } catch (error) {
                    console.error(
                        `TASK PUSH FAILED ${task.id}:`,
                        error.code || error.message
                    );
                }
            }

            await Task.markNotified(task.id, dueDate);
        }
    } catch (error) {
        console.error("TASK NOTIFICATION JOB ERROR:", error);
    } finally {
        running = false;
    }
};

if (process.env.DISABLE_INTERNAL_CRON !== "true") {
    cron.schedule("* * * * *", processTaskNotifications);
}

module.exports = {
    processTaskNotifications,
};
