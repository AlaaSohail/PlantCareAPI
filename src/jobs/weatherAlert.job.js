const cron = require("node-cron");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const WeatherAlert = require("../models/weatherAlert.model");
const { getWeatherAlertsForLocation } = require("../services/weather.service");
const { sendNotificationToUser } = require("../services/notification.service");

let running = false;

const processWeatherAlerts = async () => {
    if (running) return;
    running = true;

    try {
        const users = await User.findWeatherAlertUsers();

        for (const user of users) {
            try {
                const result = await getWeatherAlertsForLocation(
                    Number(user.latitude),
                    Number(user.longitude)
                );

                for (const alert of result.alerts) {
                    const alreadySent = await WeatherAlert.exists(user.id, alert.alertKey);
                    if (alreadySent) continue;

                    const created = await WeatherAlert.create({
                        user_id: user.id,
                        alert_key: alert.alertKey,
                        alert_type: alert.alertType,
                        severity: alert.severity,
                        forecast_date: alert.date,
                        title: alert.title,
                        message: alert.message,
                        metadata: alert.metadata,
                        expires_at: new Date(`${alert.date}T23:59:59Z`),
                    });

                    if (!created) continue;

                    await Notification.create({
                        user_id: user.id,
                        plant_id: null,
                        title: alert.title,
                        message: alert.message,
                        type: "weather",
                        dedupe_key: `notification:${alert.alertKey}:user:${user.id}`,
                        data: {
                            severity: alert.severity,
                            forecastDate: alert.date,
                            alertType: alert.alertType,
                        },
                    });

                    try {
                        await sendNotificationToUser({
                            userId: user.id,
                            token: user.fcm_token,
                            title: alert.title,
                            body: alert.message,
                            data: {
                                type: "weather",
                                severity: alert.severity,
                                forecastDate: alert.date,
                                alertType: alert.alertType,
                            },
                        });
                    } catch (error) {
                        console.error(
                            `WEATHER PUSH FAILED user=${user.id}:`,
                            error.code || error.message
                        );
                    }
                }
            } catch (error) {
                console.error(`WEATHER CHECK FAILED user=${user.id}:`, error.message);
            }
        }

        await WeatherAlert.cleanupExpired();
    } catch (error) {
        console.error("WEATHER ALERT JOB ERROR:", error);
    } finally {
        running = false;
    }
};

// Check hourly at minute 15. Dedupe prevents repeated alerts for the same forecast event.
if (process.env.DISABLE_INTERNAL_CRON !== "true") {
    cron.schedule("15 * * * *", processWeatherAlerts);
}

module.exports = {
    processWeatherAlerts,
};
