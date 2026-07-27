const { Pool } = require("pg");


const pool = new Pool({

    host: "localhost",
    user: "postgres",
    password: "135",
    database: "masaar_db",
    port: 5432

});


module.exports = pool;