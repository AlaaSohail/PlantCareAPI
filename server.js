require("dotenv").config();

const app = require("./src/app");
const db = require("./src/config/database");

require("./src/jobs/tokenCleanup.job");
require("./src/jobs/reminder.job");
require("./src/jobs/taskNotification.job");
require("./src/jobs/weatherAlert.job");

const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        const client = await db.connect();
        client.release();
        console.log("✅ Database Connected");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Database Error", error);
        process.exit(1);
    }
};

start();
