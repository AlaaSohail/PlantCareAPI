const db = require("../config/database");

class PostLike {

    static async findByUserAndPost(userId, postId) {

        const result = await db.query(
            `
            SELECT *
            FROM post_likes
            WHERE user_id = $1
            AND post_id = $2
            `,
            [userId, postId]
        );

        return result.rows[0];
    }


    static async create(userId, postId) {

        const result = await db.query(
            `
            INSERT INTO post_likes
            (
                post_id,
                user_id
            )
            VALUES
            ($1, $2)
            RETURNING *
            `,
            [postId, userId]
        );

        return result.rows[0];
    }


    static async delete(userId, postId) {

        const result = await db.query(
            `
            DELETE FROM post_likes
            WHERE user_id = $1
            AND post_id = $2
            RETURNING *
            `,
            [userId, postId]
        );

        return result.rows[0];
    }


    static async countByPost(postId) {

        const result = await db.query(
            `
            SELECT COUNT(*)::int AS count
            FROM post_likes
            WHERE post_id = $1
            `,
            [postId]
        );

        return result.rows[0].count;
    }
}

module.exports = PostLike;