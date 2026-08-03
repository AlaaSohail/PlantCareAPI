const db = require("../config/database");


class PlantHealth {


    static async create(data) {


        const result = await db.query(

            `
            INSERT INTO plant_health
            (
                plant_id,
                health_score,
                health_status,
                last_analysis_id
            )

            VALUES($1,$2,$3,$4)

            RETURNING *
            `,

            [
                data.plant_id,
                data.health_score,
                data.health_status,
                data.last_analysis_id
            ]

        );


        return result.rows[0];

    }



    static async findByPlant(plant_id){


        const result =
            await db.query(

                `
                SELECT *
                FROM plant_health
                WHERE plant_id=$1
                ORDER BY created_at DESC
                LIMIT 1
                `,

                [
                    plant_id
                ]

            );


        return result.rows[0];

    }


}


module.exports = PlantHealth;