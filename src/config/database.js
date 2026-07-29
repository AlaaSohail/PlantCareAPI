const { Pool } = require("pg");

console.log("LOADING DATABASE FILE");
console.log("DATABASE URL =", process.env.DATABASE_URL);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on("error", (err) => {
    console.log("POOL ERROR:", err);
});

module.exports = pool;