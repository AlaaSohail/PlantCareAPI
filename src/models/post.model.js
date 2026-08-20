const db = require("../config/database");

class Post {

    // Create Post
    static async create(data) {

        const result = await db.query(
            `
            INSERT INTO posts
            (
                user_id,
                content,
                image_url,
                image_public_id
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4
            )
            RETURNING *
            `,
            [
                data.user_id,
                data.content,
                data.image_url ?? null,
                data.image_public_id ?? null
            ]
        );

        return result.rows[0];
    }


    // Get All Posts
    static async findAll() {

        const result = await db.query(
            `
            SELECT
                posts.id,
                posts.content,
                posts.image_url,
                posts.created_at,

                users.id AS user_id,
                users.name AS user_name,
                users.user_image AS user_image

            FROM posts

            INNER JOIN users
                ON users.id = posts.user_id

            ORDER BY posts.created_at DESC
            `
        );

        return result.rows;
    }


    // Get One Post
    static async findById(id) {

        const result = await db.query(
            `
            SELECT
                posts.id,
                posts.content,
                posts.image_url,
                posts.created_at,

                users.id AS user_id,
                users.name AS user_name,
                users.user_image AS user_image

            FROM posts

            INNER JOIN users
                ON users.id = posts.user_id

            WHERE posts.id = $1
            `,
            [id]
        );

        return result.rows[0];
    }


    // Update Post
    static async update(id, userId, data) {

        const result = await db.query(
            `
            UPDATE posts

            SET
                content = $1,
                image_url = $2,
                image_public_id = $3

            WHERE id = $4
            AND user_id = $5

            RETURNING *
            `,
            [
                data.content,
                data.image_url,
                data.image_public_id,
                id,
                userId
            ]
        );

        return result.rows[0];
    }


    // Delete Post
    static async delete(id, userId) {

        const result = await db.query(
            `
            DELETE FROM posts

            WHERE id = $1
            AND user_id = $2

            RETURNING *
            `,
            [
                id,
                userId
            ]
        );

        return result.rows[0];
    }

}

module.exports = Post;