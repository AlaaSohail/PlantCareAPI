const db = require("../config/database");

class PostComment {

    static async create(postId, userId, content) {

        const result = await db.query(
            `
            INSERT INTO post_comments
            (
                post_id,
                user_id,
                content
            )
            VALUES
            ($1, $2, $3)
            RETURNING *
            `,
            [postId, userId, content]
        );

        return result.rows[0];
    }


    static async findByPost(postId) {

        const result = await db.query(
            `
            SELECT
                post_comments.id,
                post_comments.post_id,
                post_comments.user_id,
                post_comments.content,
                post_comments.created_at,

                users.name AS user_name,
                users.user_image

            FROM post_comments

            JOIN users
                ON users.id = post_comments.user_id

            WHERE post_comments.post_id = $1

            ORDER BY post_comments.created_at ASC
            `,
            [postId]
        );

        return result.rows;
    }


    static async findById(id) {

        const result = await db.query(
            `
            SELECT *
            FROM post_comments
            WHERE id = $1
            `,
            [id]
        );

        return result.rows[0];
    }


    static async delete(id, userId) {

        const result = await db.query(
            `
            DELETE FROM post_comments
            WHERE id = $1
            AND user_id = $2
            RETURNING *
            `,
            [id, userId]
        );

        return result.rows[0];
    }
}

module.exports = PostComment;