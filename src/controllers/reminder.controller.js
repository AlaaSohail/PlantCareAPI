const Reminder = require("../models/reminder.model");
const Plant = require("../models/plant.model");
const CareTip = require("../models/careTip.model");
const { generateCarePlan } = require("../services/carePlan.service");
const { getNextDate } = require("../utils/reminder.utils");

const REPEAT_TYPES = new Set(["once", "daily", "weekly", "monthly"]);

const normalizeRepeatType = (value) => {
    const repeat = typeof value === "string" ? value.trim().toLowerCase() : "once";
    return REPEAT_TYPES.has(repeat) ? repeat : null;
};

const createReminder = async (req, res) => {
    try {
        const plant = await Plant.findById(req.params.plantId, req.user.id);

        if (!plant) {
            return res.status(404).json({ success: false, message: "Plant not found" });
        }

        if (!req.body.reminder_date || Number.isNaN(Date.parse(req.body.reminder_date))) {
            return res.status(400).json({
                success: false,
                message: "reminder_date must be a valid date/time",
            });
        }

        const repeatType = normalizeRepeatType(req.body.repeat_type);
        if (!repeatType) {
            return res.status(400).json({
                success: false,
                message: "repeat_type must be once, daily, weekly, or monthly",
            });
        }

        const reminder = await Reminder.create({
            plant_id: plant.id,
            type: req.body.type || "custom",
            title: req.body.title || "Plant care reminder",
            description: req.body.description || null,
            reminder_date: req.body.reminder_date,
            repeat_type: repeatType,
        });

        return res.status(201).json({ success: true, reminder });
    } catch (error) {
        console.error("CREATE REMINDER ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getReminders = async (req, res) => {
    try {
        const plant = await Plant.findById(req.params.plantId, req.user.id);

        if (!plant) {
            return res.status(404).json({ success: false, message: "Plant not found" });
        }

        const reminders = await Reminder.findByPlant(plant.id);
        return res.json({ success: true, reminders });
    } catch (error) {
        console.error("GET REMINDERS ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const completeReminder = async (req, res) => {
    try {
        const existing = await Reminder.findByIdForUser(
            req.params.reminderId,
            req.user.id
        );

        if (!existing) {
            return res.status(404).json({ success: false, message: "Reminder not found" });
        }

        let reminder;

        if (["daily", "weekly", "monthly"].includes(existing.repeat_type)) {
            const baseDate = new Date(
                Math.max(new Date(existing.reminder_date).getTime(), Date.now())
            );
            const nextDate = getNextDate(baseDate, existing.repeat_type);
            reminder = await Reminder.completeRecurringForUser(
                existing.id,
                req.user.id,
                nextDate
            );
        } else {
            reminder = await Reminder.markCompleted(existing.id, req.user.id);
        }

        return res.json({ success: true, reminder });
    } catch (error) {
        console.error("COMPLETE REMINDER ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateReminder = async (req, res) => {
    try {
        const plant = await Plant.findById(req.params.plantId, req.user.id);

        if (!plant) {
            return res.status(404).json({ success: false, message: "Plant not found" });
        }

        const existing = await Reminder.findByIdForUser(
            req.params.reminderId,
            req.user.id
        );

        if (!existing || Number(existing.plant_id) !== Number(plant.id)) {
            return res.status(404).json({ success: false, message: "Reminder not found" });
        }

        const reminderDate = req.body.reminder_date ?? existing.reminder_date;
        if (!reminderDate || Number.isNaN(Date.parse(reminderDate))) {
            return res.status(400).json({
                success: false,
                message: "reminder_date must be a valid date/time",
            });
        }

        const repeatType = normalizeRepeatType(
            req.body.repeat_type ?? existing.repeat_type
        );
        if (!repeatType) {
            return res.status(400).json({
                success: false,
                message: "repeat_type must be once, daily, weekly, or monthly",
            });
        }

        const reminder = await Reminder.update(req.params.reminderId, req.user.id, {
            title: req.body.title ?? existing.title,
            description: req.body.description ?? existing.description,
            reminder_date: reminderDate,
            type: req.body.type ?? existing.type,
            repeat_type: repeatType,
        });

        return res.json({ success: true, reminder });
    } catch (error) {
        console.error("UPDATE REMINDER ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteReminder = async (req, res) => {
    try {
        const deleted = await Reminder.delete(req.params.reminderId, req.user.id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Reminder not found" });
        }

        return res.json({ success: true, message: "Reminder deleted" });
    } catch (error) {
        console.error("DELETE REMINDER ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createCarePlan = async (req, res) => {
    try {
        const plant = await Plant.findById(req.params.plantId, req.user.id);

        if (!plant) {
            return res.status(404).json({ success: false, message: "Plant not found" });
        }

        const tips = await CareTip.findByPlant(plant.id);

        if (!tips.length) {
            return res.status(400).json({
                success: false,
                message: "No care suggestions found",
            });
        }

        const plan = generateCarePlan(plant.id, tips);
        const reminders = await Reminder.createCarePlan(plan);

        return res.json({
            success: true,
            message: "Care plan created 🌱",
            reminders,
        });
    } catch (error) {
        console.error("CREATE CARE PLAN ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createReminder,
    getReminders,
    completeReminder,
    deleteReminder,
    updateReminder,
    createCarePlan,
};
