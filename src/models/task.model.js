const db = require("../config/database");

class Task {
    static async create(data, client = db) {
        const result = await client.query(
            `
            INSERT INTO plant_care_schedules
            (
                user_id,
                plant_id,
                task_type,
                title,
                description,
                interval_days,
                next_due_date,
                reminder_time,
                is_active
            )
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *
            `,
            [
                data.user_id,
                data.plant_id,
                data.task_type,
                data.title,
                data.description || null,
                data.interval_days,
                data.next_due_date,
                data.reminder_time || "09:00:00",
                data.is_active !== false,
            ]
        );

        return result.rows[0];
    }

    static async findByIdAndUser(id, user_id, client = db) {
        const result = await client.query(
            `
            SELECT
                pcs.*,
                p.name AS plant_name,
                p.species AS plant_species,
                p.image_url AS plant_image
            FROM plant_care_schedules pcs
            JOIN plants p ON p.id = pcs.plant_id
            WHERE pcs.id = $1
              AND pcs.user_id = $2
              AND p.user_id = $2
            LIMIT 1
            `,
            [id, user_id]
        );

        return result.rows[0];
    }

    static async findAllByUser(user_id) {
        const result = await db.query(
            `
            SELECT
                pcs.*,
                p.name AS plant_name,
                p.species AS plant_species,
                p.image_url AS plant_image
            FROM plant_care_schedules pcs
            JOIN plants p ON p.id = pcs.plant_id
            WHERE pcs.user_id = $1
              AND p.user_id = $1
            ORDER BY
                pcs.is_active DESC,
                pcs.next_due_date ASC,
                pcs.reminder_time ASC,
                pcs.id ASC
            `,
            [user_id]
        );

        return result.rows;
    }

    static async findDueByUser(user_id, target_date) {
        const result = await db.query(
            `
            SELECT
                pcs.id,
                pcs.plant_id,
                pcs.task_type,
                pcs.title,
                pcs.description,
                pcs.interval_days,
                pcs.next_due_date,
                pcs.reminder_time,
                pcs.is_active,
                pcs.created_at,
                pcs.updated_at,
                p.name AS plant_name,
                p.species AS plant_species,
                p.image_url AS plant_image,
                CASE
                    WHEN pcs.next_due_date < $2::date THEN true
                    ELSE false
                END AS is_overdue,
                GREATEST(($2::date - pcs.next_due_date), 0) AS overdue_days
            FROM plant_care_schedules pcs
            JOIN plants p ON p.id = pcs.plant_id
            WHERE pcs.user_id = $1
              AND p.user_id = $1
              AND pcs.is_active = true
              AND pcs.next_due_date <= $2::date
            ORDER BY
                pcs.next_due_date ASC,
                pcs.reminder_time ASC,
                pcs.id ASC
            `,
            [user_id, target_date]
        );

        return result.rows;
    }

    static async update(id, user_id, data) {
        const result = await db.query(
            `
            UPDATE plant_care_schedules
            SET
                task_type = $1,
                title = $2,
                description = $3,
                interval_days = $4,
                next_due_date = $5,
                reminder_time = $6,
                is_active = $7,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
              AND user_id = $9
            RETURNING *
            `,
            [
                data.task_type,
                data.title,
                data.description || null,
                data.interval_days,
                data.next_due_date,
                data.reminder_time || "09:00:00",
                data.is_active !== false,
                id,
                user_id,
            ]
        );

        return result.rows[0];
    }

    static async deactivate(id, user_id) {
        const result = await db.query(
            `
            UPDATE plant_care_schedules
            SET
                is_active = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
              AND user_id = $2
            RETURNING *
            `,
            [id, user_id]
        );

        return result.rows[0];
    }

    static async findForCompletion(id, user_id, client) {
        const result = await client.query(
            `
            SELECT
                pcs.*,
                p.name AS plant_name,
                p.species AS plant_species,
                p.image_url AS plant_image
            FROM plant_care_schedules pcs
            JOIN plants p ON p.id = pcs.plant_id
            WHERE pcs.id = $1
              AND pcs.user_id = $2
              AND p.user_id = $2
              AND pcs.is_active = true
            FOR UPDATE OF pcs
            `,
            [id, user_id]
        );

        return result.rows[0];
    }

    static async setNextDueDate(id, user_id, next_due_date, client) {
        const result = await client.query(
            `
            UPDATE plant_care_schedules
            SET
                next_due_date = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
              AND user_id = $3
            RETURNING *
            `,
            [next_due_date, id, user_id]
        );

        return result.rows[0];
    }
}

module.exports = Task;
