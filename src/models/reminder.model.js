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
           SELECT 

r.*,

p.user_id

FROM reminders r

JOIN plants p

ON r.plant_id = p.id

WHERE r.reminder_date <= NOW()

AND r.is_completed=false
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
                repeat_type
            )

            VALUES($1,$2,$3,$4,$5,$6)

            RETURNING *
            `,

                [

                    reminder.plant_id,

                    reminder.type,

                    reminder.title,

                    reminder.description,

                    reminder.reminder_date,

                    reminder.repeat_type

                ]

            );


            reminders.push(
                result.rows[0]
            );


        }


        return reminders;

    }
    static async updateCompleted(id, nextDate) {


        const result =
            await db.query(

                `
        UPDATE reminders

        SET
            reminder_date=$1,
            last_completed_at=NOW()

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