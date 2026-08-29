const db = require("../config/database");


class Plant {


 static async create(data) {

    const {
        user_id,
        name,
        species,
        description,
        image_url,
        image_public_id,

        health_status,
        health_score,
        watering_advice,
        sunlight_advice,
        fertilizer_advice,
        disease,
        confidence,
        recommendation
    } = data;

    const result = await db.query(
        `
        INSERT INTO plants
        (
            user_id,
            name,
            species,
            description,
            image_url,
            image_public_id,
            health_status,
            health_score,
            watering_advice,
            sunlight_advice,
            fertilizer_advice,
            disease,
            confidence,
            recommendation
        )
        VALUES (
            $1,$2,$3,$4,$5,$6,
            $7,$8,$9,$10,$11,$12,$13,$14
        )
        RETURNING *
        `,
        [
            user_id,
            name,
            species,
            description,
            image_url,
            image_public_id,

            health_status,
            health_score,
            watering_advice,
            sunlight_advice,
            fertilizer_advice,
            disease,
            confidence,
            recommendation
        ]
    );

    return result.rows[0];
}

   



    static async findById(id, user_id) {

        const result = await db.query(

            `
            SELECT *
            FROM plants
            WHERE id=$1
            AND user_id=$2
            `,

            [
                id,
                user_id
            ]

        );


        return result.rows[0];

    }



    static async delete(id, user_id) {

        const result = await db.query(

            `
            DELETE FROM plants
            WHERE id=$1
            AND user_id=$2
            RETURNING *
            `,

            [
                id,
                user_id
            ]

        );


        return result.rows[0];

    }

    static async getDetails(id) {


        const result = await db.query(

            `
        SELECT 

            p.id,
            p.user_id,
            p.name,
            p.species,
            p.image_url,
            p.description,
            p.created_at,


            (
    SELECT COALESCE(
        json_agg(r),
        '[]'
    )
    FROM reminders r
    WHERE r.plant_id = p.id
) AS reminders,


            (
                SELECT row_to_json(a)
                FROM ai_analysis a
                WHERE a.plant_id = p.id
                ORDER BY a.created_at DESC
                LIMIT 1
            ) AS latest_analysis,


            (
                SELECT row_to_json(h)
                FROM plant_health h
                WHERE h.plant_id = p.id
                ORDER BY h.created_at DESC
                LIMIT 1
            ) AS health,


           (
    SELECT COALESCE(
        json_agg(t),
        '[]'
    )
    FROM plant_care_tips t
    WHERE t.plant_id = p.id
) AS care_tips


        FROM plants p

        WHERE p.id=$1

        `,

            [
                id
            ]

        );


        return result.rows[0];

    }
  static async update(id, user_id, data) {
    const result = await db.query(
        `
        UPDATE plants
        SET
            name = $1,
            species = $2,
            description = $3,
            image_url = $4,
            image_public_id = $5

        WHERE id = $6
        AND user_id = $7

        RETURNING *
        `,
        [
            data.name,
            data.species,
            data.description,
            data.image_url,
            data.image_public_id,
            id,
            user_id
        ]
    );

    return result.rows[0];
}
    static async findByUser(user_id) {

        const result = await db.query(

            `
SELECT *
FROM plants
WHERE user_id=$1
`,

            [
                user_id
            ]

        );

        return result.rows;

    }
    static async updateAiData(plantId, userId, data) {

    const {
        health_status,
        health_score,
        watering_advice,
        sunlight_advice,
        fertilizer_advice,
        disease,
        confidence,
        recommendation
    } = data;

    const result = await db.query(
        `
        UPDATE plants
        SET
            health_status = $1,
            health_score = $2,
            watering_advice = $3,
            sunlight_advice = $4,
            fertilizer_advice = $5,
            disease = $6,
            confidence = $7,
            recommendation = $8
        WHERE id = $9
          AND user_id = $10
        RETURNING *
        `,
        [
            health_status,
            health_score,
            watering_advice,
            sunlight_advice,
            fertilizer_advice,
            disease,
            confidence,
            recommendation,
            plantId,
            userId
        ]
    );

    return result.rows[0];
}
}


module.exports = Plant;