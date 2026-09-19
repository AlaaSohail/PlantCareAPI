const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const {
    sendNotification,
} = require("../services/notification.service");

const sendTestNotification = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.fcm_token) {
            return res.status(400).json({
                success: false,
                message: "FCM token not found for this user",
            });
        }

        const messageId = await sendNotification({
            token: user.fcm_token,
            title: "Plant Care 🌱",
            body: "Notifications are working successfully!",
            data: {
                type: "test",
            },
        });

        return res.json({
            success: true,
            message: "Notification sent successfully",
            messageId,
        });
    } catch (error) {
        console.error("SEND TEST NOTIFICATION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send notification",
            error: error.message,
        });
    }
};

const getNotifications = async (req, res) => {
    try {
        const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
        const offset = Math.max(Number(req.query.offset) || 0, 0);
        const notifications = await Notification.findByUser(req.user.id, {
            limit,
            offset,
        });

        return res.json({
            success: true,
            count: notifications.length,
            notifications,
        });
    } catch (error) {
        console.error("GET NOTIFICATIONS ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.markRead(
            Number(req.params.id),
            req.user.id
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        return res.json({ success: true, notification });
    } catch (error) {
        console.error("MARK NOTIFICATION READ ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const markAllNotificationsRead = async (req, res) => {
    try {
        const updated = await Notification.markAllRead(req.user.id);
        return res.json({
            success: true,
            message: "Notifications marked as read",
            updated,
        });
    } catch (error) {
        console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.delete(
            Number(req.params.id),
            req.user.id
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        return res.json({ success: true, message: "Notification deleted" });
    } catch (error) {
        console.error("DELETE NOTIFICATION ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    sendTestNotification,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
};
