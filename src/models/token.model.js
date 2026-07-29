const db = require("../config/database");

class Token {

    static async blacklist(token, expires_at) {

        const result = await db.query(

            `
            INSERT INTO token_blacklist
            (
                token,
                expires_at
            )
            VALUES($1,$2)
            RETURNING *
            `,

            [
                token,
                expires_at
            ]

        );

        return result.rows[0];

    }

    static async isBlacklisted(token) {

        const result = await db.query(

            `
            SELECT *
            FROM token_blacklist
            WHERE token=$1
            LIMIT 1
            `,

            [token]

        );

        return result.rows[0];

    }

    static async clearExpired() {

        await db.query(

            `
            DELETE FROM token_blacklist
            WHERE expires_at < NOW()
            `

        );

    }

}

module.exports = Token;