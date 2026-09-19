const db = require("../config/database");

class Reminder {
    static async create(data) {
        const result = await db.query(
            `
            INSERT INTO reminders
            (
                plant_id,
                type,
                title,
                description,
                reminder_date,
                repeat_type,
                notification_sent_at
            )
            VALUES($1,$2,$3,$4,$5,$6,NULL)
            RETURNING *
            `,
            [
                data.plant_id,
                data.type,
                data.title,
                data.description,
                data.reminder_date,
                data.repeat_type || "once",
            ]
        );

        return result.rows[0];
    }

    static async findByPlant(plant_id) {
        const result = await db.query(
            `
            SELECT *
            FROM reminders
            WHERE plant_id = $1
            ORDER BY reminder_date ASC
            `,
            [plant_id]
        );

        return result.rows;
    }

    static async findByIdForUser(id, user_id) {
        const result = await db.query(
            `
            SELECT r.*
            FROM reminders r
            JOIN plants p ON p.id = r.plant_id
            WHERE r.id = $1
              AND p.user_id = $2
            LIMIT 1
            `,
            [id, user_id]
        );

        return result.rows[0];
    }

    static async update(id, user_id, data) {
        const result = await db.query(
            `
            UPDATE reminders r
            SET
                title = $1,
                description = $2,
                reminder_date = $3,
                type = $4,
                repeat_type = $5,
                is_completed = false,
                notification_sent_at = NULL
            FROM plants p
            WHERE r.id = $6
              AND p.id = r.plant_id
              AND p.user_id = $7
            RETURNING r.*
            `,
            [
                data.title,
                data.description,
                data.reminder_date,
                data.type,
                data.repeat_type || "once",
                id,
                user_id,
            ]
        );

        return result.rows[0];
    }

    static async delete(id, user_id) {
        const result = await db.query(
            `
            DELETE FROM reminders r
            USING plants p
            WHERE r.id = $1
              AND p.id = r.plant_id
              AND p.user_id = $2
            RETURNING r.*
            `,
            [id, user_id]
        );

        return result.rows[0];
    }

    static async findPending() {
        const result = await db.query(
            `
            SELECT
                r.*,
                p.user_id,
                p.name AS plant_name,
                u.fcm_token,
                u.notifications_enabled,
                u.task_notifications_enabled
            FROM reminders r
            JOIN plants p ON p.id = r.plant_id
            JOIN users u ON u.id = p.user_id
            WHERE r.reminder_date <= NOW()
              AND r.is_completed = false
              AND r.notification_sent_at IS NULL
            ORDER BY r.reminder_date ASC
            `
        );

        return result.rows;
    }

    static async markCompleted(id, user_id) {
        const result = await db.query(
            `
            UPDATE reminders r
            SET
                is_completed = true,
                last_completed_at = NOW(),
                notification_sent_at = COALESCE(notification_sent_at, NOW())
            FROM plants p
            WHERE r.id = $1
              AND p.id = r.plant_id
              AND p.user_id = $2
            RETURNING r.*
            `,
            [id, user_id]
        );

        return result.rows[0];
    }

    static async markNotificationSent(id) {
        const result = await db.query(
            `
            UPDATE reminders
            SET notification_sent_at = NOW()
            WHERE id = $1
              AND notification_sent_at IS NULL
            RETURNING *
            `,
            [id]
        );

        return result.rows[0];
    }

    static async rescheduleAfterNotification(id, nextDate) {
        const result = await db.query(
            `
            UPDATE reminders
            SET
                reminder_date = $1,
                notification_sent_at = NULL,
                is_completed = false
            WHERE id = $2
            RETURNING *
            `,
            [nextDate, id]
        );

        return result.rows[0];
    }

    static async completeOnceAfterNotification(id) {
        const result = await db.query(
            `
            UPDATE reminders
            SET
                is_completed = true,
                last_completed_at = NOW(),
                notification_sent_at = NOW()
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        return result.rows[0];
    }

    static async createCarePlan(data) {
        const reminders = [];

        for (const reminder of data) {
            const result = await db.query(
                `
                INSERT INTO reminders
                (
                    plant_id,
                    type,
                    title,
                    description,
                    reminder_date,
                    repeat_type,
                    notification_sent_at
                )
                VALUES($1,$2,$3,$4,$5,$6,NULL)
                RETURNING *
                `,
                [
                    reminder.plant_id,
                    reminder.type,
                    reminder.title,
                    reminder.description,
                    reminder.reminder_date,
                    reminder.repeat_type,
                ]
            );

            reminders.push(result.rows[0]);
        }

        return reminders;
    }
    static async completeRecurringForUser(id, user_id, nextDate) {
        const result = await db.query(
            `
            UPDATE reminders r
            SET
                reminder_date = $1,
                last_completed_at = NOW(),
                notification_sent_at = NULL,
                is_completed = false
            FROM plants p
            WHERE r.id = $2
              AND p.id = r.plant_id
              AND p.user_id = $3
            RETURNING r.*
            `,
            [nextDate, id, user_id]
        );

        return result.rows[0];
    }

}

module.exports = Reminder;
