const {
    messaging,
} = require("../config/firebase");
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

        data,

        android: {
            priority: "high",

            notification: {
                channelId: "plant_care_channel",
                sound: "default",
            },
        },
    };

    return await messaging.send(message);
};

module.exports = {
    sendNotification,
};
