const db = require("../config/database");


class AIAnalysis {


    static async create(data) {

        const {
            plant_id,
            plant_name,
            health_status,
            disease,
            confidence,
            recommendation,
            watering_advice,
            sunlight_advice,
            fertilizer_advice,
            image_url
        } = data;


        const result = await db.query(

            `
INSERT INTO ai_analysis
(
    plant_id,
    plant_name,
    health_status,
    disease,
    confidence,
    recommendation,
    watering_advice,
    sunlight_advice,
    fertilizer_advice,
    image_url
)

VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)

RETURNING *
`,

            [
                plant_id,
                plant_name,
                health_status,
                disease,
                confidence,
                recommendation,
                watering_advice,
                sunlight_advice,
                fertilizer_advice,
                image_url
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

    static async findByUser(user_id) {

        const result = await db.query(
            `
        SELECT ai.*
        FROM ai_analysis ai
        JOIN plants p
        ON ai.plant_id = p.id
        WHERE p.user_id=$1
        ORDER BY ai.created_at DESC
        `,
            [
                user_id
            ]
        );

        return result.rows;

    }
}


module.exports = AIAnalysis;