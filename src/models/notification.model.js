const db = require("../config/database");


class Notification {


    static async create(data){


        const result =
            await db.query(

            `
            INSERT INTO notifications
            (
                user_id,
                plant_id,
                title,
                message
            )

            VALUES($1,$2,$3,$4)

            RETURNING *
            `,

            [

                data.user_id,

                data.plant_id,

                data.title,

                data.message

            ]

        );


        return result.rows[0];

    }



    static async findByUser(user_id){


        const result =
            await db.query(

            `
            SELECT *

            FROM notifications

            WHERE user_id=$1

            ORDER BY created_at DESC

            `,

            [
                user_id
            ]

        );


        return result.rows;

    }



    static async markRead(id){


        const result =
            await db.query(

            `
            UPDATE notifications

            SET is_read=true

            WHERE id=$1

            RETURNING *
            `,

            [
                id
            ]

        );


        return result.rows[0];

    }



    static async delete(id){


        await db.query(

            `
            DELETE FROM notifications

            WHERE id=$1
            `,

            [
                id
            ]

        );

    }


}


module.exports = Notification;