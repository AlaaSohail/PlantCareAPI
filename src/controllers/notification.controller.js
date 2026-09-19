const User = require("../models/user.model");

const {
  sendNotification,
} = require("../services/notification.service");

const sendTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

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
    console.error(
      "SEND TEST NOTIFICATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
    });
  }
};

module.exports = {
  sendTestNotification,
};