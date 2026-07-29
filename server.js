require("dotenv").config();
console.log("DATABASE_URL:", process.env.DATABASE_URL);
const app = require("./src/app");

const db = require("./src/config/database");
require("./src/jobs/tokenCleanup.job");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");


// Security Middleware

app.use(helmet());


app.use(cors({

    origin: [
        "https://alaasohail.com",
        "https://www.alaasohail.com"
    ],

    methods: [
        "GET",
        "POST",
        "PUT",
        "DELETE"
    ],

    credentials: true

}));


const limiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 100,

    message: {
        success: false,
        message: "Too many requests, try again later"
    }

});


app.use("/api", limiter);



// Database

db.connect()
    .then(client => {

        console.log("✅ Database Connected");

        client.release();

    })
    .catch(err => {

        console.log("❌ Database Error");
        console.log(err);

    });



// Server

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {

    console.log(`🚀 Server running on port ${PORT}`);

});