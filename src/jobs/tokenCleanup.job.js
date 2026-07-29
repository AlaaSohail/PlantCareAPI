const cron = require("node-cron");

const Token = require("../models/token.model");


// تشغيل كل ساعة
cron.schedule("0 * * * *", async () => {

    try {

        console.log("Running token cleanup...");


        await Token.clearExpired();


        console.log("Expired tokens removed");


    } catch(error) {

        console.log(
            "Token cleanup error:",
            error
        );

    }

});