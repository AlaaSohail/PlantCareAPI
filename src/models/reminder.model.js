const db = require("../config/database");


class Reminder {


    static async create(data) {

        const {
            plant_id,
            type,
            reminder_date
        } = data;


        const result =
            await db.query(

                `
INSERT INTO plant_reminders
(
plant_id,
type,
reminder_date
)

VALUES($1,$2,$3)

RETURNING *
`,

                [
                    plant_id,
                    type,
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
plant_reminders.*,
plants.name

FROM plant_reminders

JOIN plants

ON plants.id = plant_reminders.plant_id

WHERE plants.user_id=$1

ORDER BY reminder_date ASC

`,

                [user_id]

            );


        return result.rows;


    }



}


module.exports = Reminder;