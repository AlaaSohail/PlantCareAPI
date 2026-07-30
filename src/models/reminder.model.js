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
                repeat_type
            )

            VALUES($1,$2,$3,$4,$5,$6)

            RETURNING *
            `,

            [
                data.plant_id,
                data.type,
                data.title,
                data.description,
                data.reminder_date,
                data.repeat_type || "once"
            ]

        );

        return result.rows[0];

    }



    static async findByPlant(plant_id) {

        const result = await db.query(

            `
            SELECT *
            FROM reminders
            WHERE plant_id=$1
            ORDER BY reminder_date ASC
            `,

            [
                plant_id
            ]

        );

        return result.rows;

    }



    static async findById(id) {

        const result = await db.query(

            `
            SELECT *
            FROM reminders
            WHERE id=$1
            `,

            [
                id
            ]

        );

        return result.rows[0];

    }



    static async update(id, data) {

        const result = await db.query(

            `
            UPDATE reminders

            SET
                title=$1,
                description=$2,
                reminder_date=$3,
                type=$4,
                repeat_type=$5

            WHERE id=$6

            RETURNING *
            `,

            [
                data.title,
                data.description,
                data.reminder_date,
                data.type,
                data.repeat_type || "once",
                id
            ]

        );

        return result.rows[0];

    }



    static async delete(id) {

        await db.query(

            `
            DELETE FROM reminders
            WHERE id=$1
            `,

            [
                id
            ]

        );

    }



    static async findPending() {

        const result = await db.query(

            `
            SELECT *
            FROM reminders
            WHERE
                is_completed = false
                AND reminder_date <= NOW()
            ORDER BY reminder_date ASC
            `

        );

        return result.rows;

    }



    static async markCompleted(id) {

        const result = await db.query(

            `
            UPDATE reminders

            SET
                is_completed = true

            WHERE id=$1

            RETURNING *
            `,

            [
                id
            ]

        );

        return result.rows[0];

    }



    static async updateNextDate(id, nextDate) {

        const result = await db.query(

            `
            UPDATE reminders

            SET
                reminder_date=$1

            WHERE id=$2

            RETURNING *
            `,

            [
                nextDate,
                id
            ]

        );

        return result.rows[0];

    }

}

module.exports = Reminder;