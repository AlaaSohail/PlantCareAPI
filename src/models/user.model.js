const db = require("../config/database");


class User {


    static async create(data) {

        const result = await db.query(

            `
        INSERT INTO users
        (
            name,
            email,
            password,
            phone_number,
            user_image,
            latitude,
            longitude,
            country,
            city,
            fcm_token,
            email_verified,
            email_verification_token,
            email_verification_expires
        )

        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13
        )

        RETURNING *
        `,

            [
                data.name,
                data.email,
                data.password,
                data.phoneNumber,
                data.userImage,
                data.latitude,
                data.longitude,
                data.country,
                data.city,
                data.fcm_token || null,

                data.emailVerified ?? false,

                data.emailVerificationToken || null,

                data.emailVerificationExpires || null
            ]

        );

        return result.rows[0];
    }


    static async findByEmail(email) {

        const result = await db.query(

            `
SELECT * FROM users
WHERE email=$1
`,

            [email]

        );


        return result.rows[0];

    }

    static async findByVerificationToken(token) {
        const result = await db.query(
            `
        SELECT *
        FROM users
        WHERE email_verification_token = $1
        AND email_verification_expires > NOW()
        `,
            [token]
        );

        return result.rows[0];
    }
    static async verifyEmail(id) {

        const result = await db.query(

            `
        UPDATE users

        SET
            email_verified = true,
            email_verification_token = NULL,
            email_verification_expires = NULL

        WHERE id = $1

        RETURNING *
        `,

            [id]

        );

        return result.rows[0];
    }
    static async updateVerificationToken(
        id,
        token,
        expires
    ) {

        const result = await db.query(

            `
        UPDATE users

        SET
            email_verification_token = $1,
            email_verification_expires = $2

        WHERE id = $3

        RETURNING *
        `,

            [
                token,
                expires,
                id
            ]

        );

        return result.rows[0];
    }
    static async findById(id) {

        const result = await db.query(

            `
        SELECT *
        FROM users
        WHERE id=$1
        `,

            [id]

        );


        return result.rows[0];

    }


    static async saveResetToken(email, token, expire) {

        const result = await db.query(
            `
        UPDATE users
        SET reset_token=$1,
        reset_token_expire=$2
        WHERE email=$3
        RETURNING *
        `,
            [
                token,
                expire,
                email
            ]
        );

        return result.rows[0];

    }


    static async findByResetToken(token) {

        const result = await db.query(
            `
        SELECT *
        FROM users
        WHERE reset_token=$1
        AND reset_token_expire > NOW()
        `,
            [token]
        );


        return result.rows[0];

    }


    static async updatePassword(id, password) {

        const result = await db.query(
            `
        UPDATE users
        SET password=$1,
        reset_token=NULL,
        reset_token_expire=NULL
        WHERE id=$2
        RETURNING *
        `,
            [
                password,
                id
            ]
        );


        return result.rows[0];

    }

    static async findAll() {

        const result = await db.query(
            `
        SELECT 
            id,
            name,
            email,
            phone_number,
            location,
            user_image,
        
            provider,
            created_at,
            role
        FROM users
        `
        );

        return result.rows;

    }

    static async findAllPaginated(limit, offset) {

        const result = await db.query(
            `
        SELECT
            id,
            name,
            email,
            phone_number,
            location,
            user_image,
            provider,
            created_at,
            role
        FROM users
        ORDER BY id DESC
        LIMIT $1 OFFSET $2
        `,
            [
                limit,
                offset
            ]
        );


        return result.rows;

    }
    static async countUsers() {

        const result = await db.query(
            `
        SELECT COUNT(*) 
        FROM users
        `
        );


        return parseInt(result.rows[0].count);

    }


    static async updateProfile(id, data) {

        const result = await db.query(
            `
        UPDATE users
        SET
            name = $1,
            email = $2,
            phone_number = $3,
            location = $4,
            user_image = $5
        WHERE id = $6
        RETURNING
            id,
            name,
            email,
            role,
            phone_number,
            user_image,
            location,
            latitude,
            longitude,
            country,
            city,
            created_at
        `,
            [
                data.name,
                data.email,
                data.phoneNumber,
                data.location,
                data.userImage,
                id
            ]
        );

        return result.rows[0];
    }

    static async delete(id) {


        await db.query(

            `
        DELETE FROM users
        WHERE id=$1
        `,

            [id]

        );


    }
    static async updateLocation(id, data) {

        const result =
            await db.query(

                `
UPDATE users
SET
latitude=$1,
longitude=$2,
country=$3,
city=$4
WHERE id=$5
RETURNING *
`,
                [
                    data.latitude,
                    data.longitude,
                    data.country,
                    data.city,
                    id
                ]

            );


        return result.rows[0];

    }

}


module.exports = User;