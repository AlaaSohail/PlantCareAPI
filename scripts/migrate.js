require("dotenv").config();

const fs = require("fs");
const path = require("path");
const db = require("../src/config/database");

const run = async () => {
    const databaseDir = path.join(__dirname, "..", "database");
    const files = fs
        .readdirSync(databaseDir)
        .filter((file) => file.endsWith(".sql"))
        .sort();

    try {
        for (const file of files) {
            const sql = fs.readFileSync(path.join(databaseDir, file), "utf8");
            console.log(`▶ Running ${file}`);
            await db.query(sql);
            console.log(`✅ ${file}`);
        }

        console.log("✅ All migrations completed");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
};

run();
