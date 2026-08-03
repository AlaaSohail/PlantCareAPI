const db = require("../config/database");


class CareTip {


    static async create(data){


        const result = await db.query(

            `
            INSERT INTO plant_care_tips
            (
                plant_id,
                type,
                title,
                description
            )

            VALUES($1,$2,$3,$4)

            RETURNING *
            `,

            [
                data.plant_id,
                data.type,
                data.title,
                data.description
            ]

        );


        return result.rows[0];

    }



    static async findByPlant(plant_id){


        const result = await db.query(

            `
            SELECT *
            FROM plant_care_tips

            WHERE plant_id=$1

            ORDER BY created_at DESC
            `,

            [
                plant_id
            ]

        );


        return result.rows;

    }



    static async deleteByPlant(plant_id){


        await db.query(

            `
            DELETE FROM plant_care_tips

            WHERE plant_id=$1
            `,

            [
                plant_id
            ]

        );

    }


}


module.exports = CareTip;