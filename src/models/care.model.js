const db = require("../config/database");


class Care {


    static async create(data){

        const {
            plant_id,
            action,
            notes
        } = data;


        const result = await db.query(

            `
            INSERT INTO plant_care_logs
            (
                plant_id,
                action,
                notes
            )

            VALUES($1,$2,$3)

            RETURNING *
            `,

            [
                plant_id,
                action,
                notes
            ]

        );


        return result.rows[0];

    }




    static async findByPlant(plant_id){


        const result = await db.query(

            `
            SELECT *
            FROM plant_care_logs

            WHERE plant_id=$1

            ORDER BY created_at DESC
            `,

            [
                plant_id
            ]

        );


        return result.rows;

    }


}


module.exports = Care;