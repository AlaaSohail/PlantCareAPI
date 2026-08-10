const { Pool } = require("pg");

console.log("LOADING DATABASE FILE");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },

});
pool.query("SELECT NOW()")
    .then((result) => {
        console.log("✅ Neon connected:", result.rows[0]);
    })
    .catch((err) => {
        console.error("❌ Neon connection failed:", err.message);
    });
pool.on("error", (err) => {
    console.error("POOL ERROR:", err);
});

module.exports = pool;