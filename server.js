require("dotenv").config();
require("dotenv").config();

console.log("Current folder:");
console.log(process.cwd());

console.log("Env files:");
const fs = require("fs");
console.log(fs.readdirSync(process.cwd()));
const app = require("./src/app");

const db = require("./src/config/database");


db.connect()
.then(client => {

    console.log("✅ Database Connected");

    client.release();

})
.catch(err => {

    console.log("❌ Database Error");
    console.log(err);

});


const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {

console.log(`🚀 Server running on port ${PORT}`);

});