const db = require("../config/database");
const Task = require("../models/task.model");
const Plant = require("../models/plant.model");
const Care = require("../models/care.model");

const TASK_TYPES = new Set([
    "watering",
    "fertilizer",
    "sunlight",
    "health_check",
    "pruning",
    "misting",
    "custom",
]);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

const isValidDateString = (value) => {
    if (typeof value !== "string" || !DATE_RE.test(value)) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
};

const formatDateUTC = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getServerDate = () => formatDateUTC(new Date());

const addDays = (dateString, days) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + days);
    return formatDateUTC(date);
};

const normalizeTaskType = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

const parseIntervalDays = (value) => {
    const interval = Number(value);

    if (!Number.isInteger(interval) || interval < 1 || interval > 3650) {
        return null;
    }

    return interval;
};

const validateTaskInput = (body, { partial = false } = {}) => {
    const errors = [];

    if (!partial || body.task_type !== undefined) {
        const taskType = normalizeTaskType(body.task_type);
        if (!TASK_TYPES.has(taskType)) {
            errors.push(
                `task_type must be one of: ${Array.from(TASK_TYPES).join(", ")}`
            );
        }
    }

    if (!partial || body.title !== undefined) {
        if (typeof body.title !== "string" || !body.title.trim()) {
            errors.push("title is required");
        } else if (body.title.trim().length > 150) {
            errors.push("title must be 150 characters or fewer");
        }
    }

    if (!partial || body.interval_days !== undefined) {
        if (parseIntervalDays(body.interval_days) === null) {
            errors.push("interval_days must be an integer between 1 and 3650");
        }
    }

    if (!partial || body.next_due_date !== undefined) {
        if (!isValidDateString(body.next_due_date)) {
            errors.push("next_due_date must use YYYY-MM-DD format");
        }
    }

    if (body.reminder_time !== undefined && body.reminder_time !== null) {
        if (typeof body.reminder_time !== "string" || !TIME_RE.test(body.reminder_time)) {
            errors.push("reminder_time must use HH:mm or HH:mm:ss format");
        }
    }

    if (body.description !== undefined && body.description !== null) {
        if (typeof body.description !== "string") {
            errors.push("description must be a string");
        }
    }

    if (body.is_active !== undefined && typeof body.is_active !== "boolean") {
        errors.push("is_active must be true or false");
    }

    return errors;
};

const createTaskSchedule = async (req, res) => {
    try {
        const body = req.body || {};
        const plantId = Number(body.plant_id);

        if (!Number.isInteger(plantId) || plantId <= 0) {
            return res.status(400).json({
                success: false,
                message: "plant_id must be a valid integer",
            });
        }

        const errors = validateTaskInput(body);

        if (errors.length) {
            return res.status(400).json({
                success: false,
                message: errors[0],
                errors,
            });
        }

        const plant = await Plant.findById(plantId, req.user.id);

        if (!plant) {
            return res.status(404).json({
                success: false,
                message: "Plant not found",
            });
        }

        const task = await Task.create({
            user_id: req.user.id,
            plant_id: plant.id,
            task_type: normalizeTaskType(body.task_type),
            title: body.title.trim(),
            description:
                typeof body.description === "string"
                    ? body.description.trim()
                    : null,
            interval_days: parseIntervalDays(body.interval_days),
            next_due_date: body.next_due_date,
            reminder_time: body.reminder_time || "09:00:00",
            is_active: body.is_active !== false,
        });

        return res.status(201).json({
            success: true,
            message: "Task schedule created successfully",
            task,
        });
    } catch (error) {
        console.error("CREATE TASK ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "An active task with this type already exists for this plant",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const getTaskSchedules = async (req, res) => {
    try {
        const tasks = await Task.findAllByUser(req.user.id);

        return res.json({
            success: true,
            count: tasks.length,
            tasks,
        });
    } catch (error) {
        console.error("GET TASK SCHEDULES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const getTodayTasks = async (req, res) => {
    try {
        const targetDate = req.query.date || getServerDate();

        if (!isValidDateString(targetDate)) {
            return res.status(400).json({
                success: false,
                message: "date must use YYYY-MM-DD format",
            });
        }

        const tasks = await Task.findDueByUser(req.user.id, targetDate);

        const overdue = tasks.filter((task) => task.is_overdue).length;

        return res.json({
            success: true,
            date: targetDate,
            count: tasks.length,
            overdue_count: overdue,
            tasks,
        });
    } catch (error) {
        console.error("GET TODAY TASKS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const updateTaskSchedule = async (req, res) => {
    try {
        const body = req.body || {};
        const taskId = Number(req.params.id);

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid task id",
            });
        }

        const existing = await Task.findByIdAndUser(taskId, req.user.id);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        const errors = validateTaskInput(body, { partial: true });

        if (errors.length) {
            return res.status(400).json({
                success: false,
                message: errors[0],
                errors,
            });
        }

        const task = await Task.update(taskId, req.user.id, {
            task_type:
                body.task_type !== undefined
                    ? normalizeTaskType(body.task_type)
                    : existing.task_type,
            title:
                body.title !== undefined
                    ? body.title.trim()
                    : existing.title,
            description:
                body.description !== undefined
                    ? body.description?.trim() || null
                    : existing.description,
            interval_days:
                body.interval_days !== undefined
                    ? parseIntervalDays(body.interval_days)
                    : Number(existing.interval_days),
            next_due_date:
                body.next_due_date !== undefined
                    ? body.next_due_date
                    : formatDateUTC(new Date(existing.next_due_date)),
            reminder_time:
                body.reminder_time !== undefined
                    ? body.reminder_time
                    : existing.reminder_time,
            is_active:
                body.is_active !== undefined
                    ? body.is_active
                    : existing.is_active,
        });

        return res.json({
            success: true,
            message: "Task schedule updated successfully",
            task,
        });
    } catch (error) {
        console.error("UPDATE TASK ERROR:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "An active task with this type already exists for this plant",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const deleteTaskSchedule = async (req, res) => {
    try {
        const taskId = Number(req.params.id);

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid task id",
            });
        }

        const task = await Task.deactivate(taskId, req.user.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        return res.json({
            success: true,
            message: "Task schedule disabled successfully",
            task,
        });
    } catch (error) {
        console.error("DELETE TASK ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const completeTask = async (req, res) => {
    let client;

    try {
        const taskId = Number(req.params.id);
        const body = req.body || {};

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid task id",
            });
        }

        const completedDate = body.completed_date || getServerDate();

        if (!isValidDateString(completedDate)) {
            return res.status(400).json({
                success: false,
                message: "completed_date must use YYYY-MM-DD format",
            });
        }

        client = await db.connect();
        await client.query("BEGIN");

        const task = await Task.findForCompletion(taskId, req.user.id, client);

        if (!task) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        const dueDate = formatDateUTC(new Date(task.next_due_date));

        if (dueDate > completedDate) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                code: "TASK_NOT_DUE",
                message: "This task is not due yet",
                next_due_date: dueDate,
            });
        }

        const careLog = await Care.create(
            {
                plant_id: task.plant_id,
                action: task.task_type,
                notes: `Daily task completed: ${task.title}`,
            },
            client
        );

        const nextDueDate = addDays(completedDate, Number(task.interval_days));

        const updatedTask = await Task.setNextDueDate(
            task.id,
            req.user.id,
            nextDueDate,
            client
        );

        await client.query("COMMIT");

        return res.json({
            success: true,
            message: "Task completed successfully",
            completed_date: completedDate,
            next_due_date: nextDueDate,
            care_log: careLog,
            task: updatedTask,
        });
    } catch (error) {
        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (_) {
                // Ignore rollback errors so the original error is preserved.
            }
        }

        console.error("COMPLETE TASK ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    } finally {
        if (client) {
            client.release();
        }
    }
};

module.exports = {
    createTaskSchedule,
    getTaskSchedules,
    getTodayTasks,
    updateTaskSchedule,
    deleteTaskSchedule,
    completeTask,
};
