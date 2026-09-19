const {
    getMessagingClient,
} = require("../config/firebase");

const User = require("../models/user.model");

const normalizeData = (data = {}) => {
    const normalized = {};

    for (const [key, value] of Object.entries(data || {})) {
        if (value === undefined || value === null) continue;
        normalized[String(key)] =
            typeof value === "string" ? value : JSON.stringify(value);
    }

    return normalized;
};

const isInvalidFcmTokenError = (error) => {
    const code = error?.code || "";

    return [
        "messaging/registration-token-not-registered",
        "messaging/invalid-registration-token",
        "messaging/invalid-argument",
    ].includes(code);
};

const sendNotification = async ({
    token,
    title,
    body,
    data = {},
}) => {
    if (!token) {
        throw new Error("FCM token is required");
    }

    const message = {
        token,
        notification: {
            title,
            body,
        },
        data: normalizeData(data),
        android: {
            priority: "high",
            notification: {
                channelId: "plant_care_channel",
                sound: "default",
            },
        },
        apns: {
            payload: {
                aps: {
                    sound: "default",
                },
            },
        },
    };

    return getMessagingClient().send(message);
};

const sendNotificationToUser = async ({
    userId,
    title,
    body,
    data = {},
    token = null,
}) => {
    const user = token ? null : await User.findById(userId);
    const fcmToken = token || user?.fcm_token;

    if (!fcmToken) {
        return {
            sent: false,
            reason: "NO_FCM_TOKEN",
        };
    }

    try {
        const messageId = await sendNotification({
            token: fcmToken,
            title,
            body,
            data,
        });

        return {
            sent: true,
            messageId,
        };
    } catch (error) {
        if (isInvalidFcmTokenError(error)) {
            try {
                await User.clearFcmToken(userId);
            } catch (clearError) {
                console.error("CLEAR INVALID FCM TOKEN ERROR:", clearError.message);
            }
        }

        throw error;
    }
};

module.exports = {
    sendNotification,
    sendNotificationToUser,
    isInvalidFcmTokenError,
};
