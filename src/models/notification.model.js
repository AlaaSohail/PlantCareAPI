const db = require("../config/database");

class Notification {
    static async create(data, client = db) {
        const result = await client.query(
            `
            INSERT INTO notifications
            (
                user_id,
                plant_id,
                title,
                message,
                type,
                data,
                dedupe_key
            )
            VALUES($1,$2,$3,$4,$5,$6::jsonb,$7)
            ON CONFLICT (dedupe_key)
            WHERE dedupe_key IS NOT NULL
            DO NOTHING
            RETURNING *
            `,
            [
                data.user_id,
                data.plant_id ?? null,
                data.title,
                data.message,
                data.type || "general",
                JSON.stringify(data.data || {}),
                data.dedupe_key || null,
            ]
        );

        return result.rows[0] || null;
    }

    static async findByUser(user_id, { limit = 50, offset = 0 } = {}) {
        const result = await db.query(
            `
            SELECT *
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            `,
            [user_id, limit, offset]
        );

        return result.rows;
    }

    static async markRead(id, user_id) {
        const result = await db.query(
            `
            UPDATE notifications
            SET is_read = true
            WHERE id = $1
              AND user_id = $2
            RETURNING *
            `,
            [id, user_id]
        );

        return result.rows[0];
    }

    static async markAllRead(user_id) {
        const result = await db.query(
            `
            UPDATE notifications
            SET is_read = true
            WHERE user_id = $1
              AND is_read = false
            RETURNING id
            `,
            [user_id]
        );

        return result.rowCount;
    }

    static async delete(id, user_id) {
        const result = await db.query(
            `
            DELETE FROM notifications
            WHERE id = $1
              AND user_id = $2
            RETURNING *
            `,
            [id, user_id]
        );

        return result.rows[0];
    }
}

module.exports = Notification;
