const db = require("../config/database");

class PostComment {

    // Add Comment
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
            (
                $1,
                $2,
                $3
            )
            RETURNING *
            `,
            [
                postId,
                userId,
                content
            ]
        );

        return result.rows[0];
    }


    // Get Comments
    static async findByPost(postId) {

        const result = await db.query(
            `
            SELECT
                pc.id,
                pc.post_id,
                pc.user_id,
                pc.content,
                pc.created_at,

                u.name AS user_name,
                u.user_image

            FROM post_comments pc

            JOIN users u
                ON u.id = pc.user_id

            WHERE pc.post_id = $1

            ORDER BY pc.created_at ASC
            `,
            [postId]
        );

        return result.rows;
    }


    // Find Comment
    static async findById(commentId) {

        const result = await db.query(
            `
            SELECT *
            FROM post_comments
            WHERE id = $1
            `,
            [commentId]
        );

        return result.rows[0];
    }


    // Delete Comment
    static async delete(commentId, userId) {

        const result = await db.query(
            `
            DELETE FROM post_comments

            WHERE id = $1
            AND user_id = $2

            RETURNING *
            `,
            [
                commentId,
                userId
            ]
        );

        return result.rows[0];
    }

}

module.exports = PostComment;