const db = require("../config/database");


class AIAnalysis {


    static async create(data) {


        const {

            user_id,

            plant_id,

            image_url,

            disease,

            confidence,

            recommendation

        } = data;



        const result =
            await db.query(

                `
INSERT INTO ai_analysis

(
user_id,
plant_id,
image_url,
disease,
confidence,
recommendation
)

VALUES($1,$2,$3,$4,$5,$6)

RETURNING *

`,

                [
                    user_id,
                    plant_id,
                    image_url,
                    disease,
                    confidence,
                    recommendation
                ]

            );



        return result.rows[0];


    }




    static async findByUser(user_id) {


        const result =
            await db.query(

                `
SELECT *
FROM ai_analysis

WHERE user_id=$1

ORDER BY created_at DESC

`,

                [user_id]

            );


        return result.rows;


    }



}



module.exports = AIAnalysis;