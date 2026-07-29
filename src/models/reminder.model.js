const db = require("../config/database");


class Reminder {


    static async create(data) {

        const {
            plant_id,
            type,
            title,
            description,
            reminder_date
        } = data;


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
                plant_id,
                type,
                title,
                description,
                reminder_date
            ]
        );


        return result.rows[0];

    }


    static async findByUser(user_id) {


        const result =
            await db.query(

                `
SELECT 
reminders.*,
plants.name

FROM reminders

JOIN plants

ON plants.id = reminders.plant_id

WHERE plants.user_id=$1

ORDER BY reminder_date ASC

`,

                [user_id]

            );


        return result.rows;


    }



}


module.exports = Reminder;