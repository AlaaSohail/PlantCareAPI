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
                reminder_date
            )

            VALUES($1,$2,$3,$4,$5)

            RETURNING *
            `,

            [
                data.plant_id,
                data.type,
                data.title,
                data.description,
                data.reminder_date
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
                type=$4

            WHERE id=$5

            RETURNING *
            `,

            [
                data.title,
                data.description,
                data.reminder_date,
                data.type,
                id
            ]

        );


        return result.rows[0];

    }





    static async complete(id) {


        const result = await db.query(

            `
            UPDATE reminders

            SET
                is_completed=true

            WHERE id=$1

            RETURNING *
            `,

            [
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


}


module.exports = Reminder;