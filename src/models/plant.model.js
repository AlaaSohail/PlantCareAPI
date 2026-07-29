const db = require("../config/database");


class Plant {


    static async create(data) {

        const {
            user_id,
            name,
            species,
            image_url
        } = data;


        const result = await db.query(

            `
            INSERT INTO plants
            (
                user_id,
                name,
                species,
                image_url
            )

            VALUES($1,$2,$3,$4)

            RETURNING *
            `,

            [
                user_id,
                name,
                species,
                image_url
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
            ORDER BY created_at DESC
            `,

            [user_id]

        );


        return result.rows;

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
            p.created_at,

            (
                SELECT json_agg(r)
                FROM reminders r
                WHERE r.plant_id = p.id
            ) AS reminders,

            (
                SELECT row_to_json(a)
                FROM ai_analysis a
                WHERE a.plant_id = p.id
                ORDER BY a.created_at DESC
                LIMIT 1
            ) AS latest_analysis

        FROM plants p

        WHERE p.id=$1
        `,

            [id]

        );


        return result.rows[0];

    }
    static async update(id, user_id, data) {


        const result = await db.query(

            `
UPDATE plants

SET
name=$1,
species=$2,
image_url=$3

WHERE id=$4
AND user_id=$5

RETURNING *

`,

            [
                data.name,
                data.species,
                data.image_url,
                id,
                user_id
            ]


        );


        return result.rows[0];

    }
    static async update(id, user_id, data) {


        const result = await db.query(

            `
        UPDATE plants

        SET
            name=$1,
            species=$2,
            image_url=$3

        WHERE id=$4
        AND user_id=$5

        RETURNING *

        `,

            [
                data.name,
                data.species,
                data.image_url,
                id,
                user_id
            ]

        );


        return result.rows[0];

    }
}


module.exports = Plant;