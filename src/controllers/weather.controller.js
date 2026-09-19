const User = require("../models/user.model");
const { getWeatherAlertsForLocation } = require("../services/weather.service");

const getWeatherAlerts = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.latitude === null || user.longitude === null) {
            return res.status(400).json({
                success: false,
                message: "User location is required for weather alerts",
            });
        }

        const result = await getWeatherAlertsForLocation(
            Number(user.latitude),
            Number(user.longitude)
        );

        return res.json({
            success: true,
            timezone: result.timezone,
            count: result.alerts.length,
            has_warning: result.alerts.length > 0,
            alerts: result.alerts,
        });
    } catch (error) {
        console.error("GET WEATHER ALERTS ERROR:", error.message);
        return res.status(502).json({
            success: false,
            message: "Weather service unavailable",
        });
    }
};

module.exports = {
    getWeatherAlerts,
};
