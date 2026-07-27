const db = require("../config/database");


class User {


    static async create(data) {

        const result = await db.query(

            `
INSERT INTO users
(name,email,password)
VALUES($1,$2,$3)
RETURNING *
`,

            [
                data.name,
                data.email,
                data.password
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


    static async findById(id) {

        const result = await db.query(

            `
    SELECT id,name,email,provider,created_at
    FROM users
    WHERE id=$1
    `,

            [id]

        );


        return result.rows[0];

    }


    static async saveResetToken(email, token, expire){

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


static async findByResetToken(token){

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


static async updatePassword(id,password){

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


}


module.exports = User;