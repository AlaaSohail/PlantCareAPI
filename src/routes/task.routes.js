const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
    createTaskSchedule,
    getTaskSchedules,
    getTodayTasks,
    updateTaskSchedule,
    deleteTaskSchedule,
    completeTask,
} = require("../controllers/task.controller");

// All care schedules for the signed-in user
router.get(
    "/schedules",
    authMiddleware,
    getTaskSchedules
);

// Create a recurring care schedule
router.post(
    "/schedules",
    authMiddleware,
    createTaskSchedule
);

// Tasks due today (and overdue tasks that are still unfinished)
// Optional: ?date=YYYY-MM-DD so Flutter can send the user's local date.
router.get(
    "/today",
    authMiddleware,
    getTodayTasks
);

// Edit a schedule
router.patch(
    "/:id",
    authMiddleware,
    updateTaskSchedule
);

// Disable a schedule without deleting its history
router.delete(
    "/:id",
    authMiddleware,
    deleteTaskSchedule
);

// Complete a due task and move it to its next date
router.post(
    "/:id/complete",
    authMiddleware,
    completeTask
);

module.exports = router;
