const db = require("../config/database");

class WeatherAlert {
    static async exists(userId, alertKey) {
        const result = await db.query(
            `
            SELECT id
            FROM weather_alert_events
            WHERE user_id = $1
              AND alert_key = $2
            LIMIT 1
            `,
            [userId, alertKey]
        );

        return Boolean(result.rows[0]);
    }

    static async create(data) {
        const result = await db.query(
            `
            INSERT INTO weather_alert_events
            (
                user_id,
                alert_key,
                alert_type,
                severity,
                forecast_date,
                title,
                message,
                metadata,
                expires_at
            )
            VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9)
            ON CONFLICT (user_id, alert_key)
            DO NOTHING
            RETURNING *
            `,
            [
                data.user_id,
                data.alert_key,
                data.alert_type,
                data.severity,
                data.forecast_date || null,
                data.title,
                data.message,
                JSON.stringify(data.metadata || {}),
                data.expires_at || null,
            ]
        );

        return result.rows[0] || null;
    }

    static async cleanupExpired() {
        const result = await db.query(
            `
            DELETE FROM weather_alert_events
            WHERE expires_at IS NOT NULL
              AND expires_at < NOW() - INTERVAL '7 days'
            `
        );

        return result.rowCount;
    }
}

module.exports = WeatherAlert;
