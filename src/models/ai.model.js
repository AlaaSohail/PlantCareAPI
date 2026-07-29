const db = require("../config/database");


class AIAnalysis {


    static async create(data) {


        const {

            plant_id,
            image_url,
            disease,
            confidence,
            recommendation

        } = data;



        const result = await db.query(

            `
            INSERT INTO ai_analysis
            (
                plant_id,
                image_url,
                disease,
                confidence,
                recommendation
            )

            VALUES($1,$2,$3,$4,$5)

            RETURNING *
            `,

            [
                plant_id,
                image_url,
                disease,
                confidence,
                recommendation
            ]

        );


        return result.rows[0];

    }




    static async findByPlant(plant_id) {


        const result = await db.query(

            `
            SELECT *
            FROM ai_analysis

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


module.exports = AIAnalysis;