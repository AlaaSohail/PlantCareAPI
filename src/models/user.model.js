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
            provider,
            phone_number,
            user_image,
            latitude,
            longitude,
            country,
            city,
            fcm_token,
            email_verified,
            email_verification_token,
            email_verification_expires,
            google_id,
            apple_id,
            facebook_id
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
            $13,
            $14,
            $15,
            $16,
            $17
        )

        RETURNING *
        `,

            [
                data.name,
                data.email,
                data.password ?? null,
                data.provider ?? "local",

                data.phoneNumber ?? null,
                data.userImage ?? null,

                data.latitude ?? null,
                data.longitude ?? null,

                data.country ?? null,
                data.city ?? null,

                data.fcm_token ?? null,

                data.emailVerified ?? false,

                data.emailVerificationToken ?? null,
                data.emailVerificationExpires ?? null,

                data.googleId ?? null,
                data.appleId ?? null,
                data.facebookId ?? null
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
static async findByGoogleId(googleId) {

    const result = await db.query(
        `
        SELECT *
        FROM users
        WHERE google_id = $1
        `,
        [googleId]
    );

    return result.rows[0];
}
static async updateGoogleId(id, googleId) {

    const result = await db.query(
        `
        UPDATE users
        SET
            google_id = $1,
            provider = 'google',
            email_verified = true
        WHERE id = $2
        RETURNING *
        `,
        [
            googleId,
            id
        ]
    );

    return result.rows[0];
}
static async findByFacebookId(facebookId) {

    const result = await db.query(
        `
        SELECT *
        FROM users
        WHERE facebook_id = $1
        `,
        [facebookId]
    );

    return result.rows[0];
}


static async updateFacebookId(id, facebookId) {

    const result = await db.query(
        `
        UPDATE users
        SET
            facebook_id = $1,
            provider = 'facebook',
            email_verified = true
        WHERE id = $2
        RETURNING *
        `,
        [
            facebookId,
            id
        ]
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


    static async saveResetCode(email, code, expire) {

        const result = await db.query(
            `
        UPDATE users
        SET
            reset_code = $1,
            reset_code_expire = $2
        WHERE email = $3
        RETURNING *
        `,
            [
                code,
                expire,
                email
            ]
        );

        return result.rows[0];
    }


    static async findByResetCode(email, code) {

        const result = await db.query(
            `
        SELECT *
        FROM users
        WHERE email = $1
        AND reset_code = $2
        AND reset_code_expire > NOW()
        `,
            [
                email,
                code
            ]
        );

        return result.rows[0];
    }


    static async clearResetCode(id) {

        const result = await db.query(
            `
        UPDATE users
        SET
            reset_code = NULL,
            reset_code_expire = NULL
        WHERE id = $1
        RETURNING *
        `,
            [id]
        );

        return result.rows[0];
    }
    static async createPasswordResetToken(id, token, expire) {

        const result = await db.query(
            `
        UPDATE users
        SET
            reset_token = $1,
            reset_token_expire = $2
        WHERE id = $3
        RETURNING *
        `,
            [
                token,
                expire,
                id
            ]
        );

        return result.rows[0];
    }

    static async updatePassword(id, password) {

        const result = await db.query(
            `
        UPDATE users
        SET
            password = $1,
            reset_token = NULL,
            reset_token_expire = NULL,
            reset_code = NULL,
            reset_code_expire = NULL
        WHERE id = $2
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