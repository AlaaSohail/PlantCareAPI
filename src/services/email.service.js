const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",

    port: 587,

    secure: false, // مهم: لا تستخدم 465

    family: 4, // IPv4

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASSWORD

    },

    tls: {
        rejectUnauthorized: false
    }

});



const sendResetEmail = async (email, token) => {


    const resetUrl =
        `https://plantcare.app/reset-password?token=${token}`;


    await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to: email,

        subject: "PlantCare Password Reset",

        html: `

        <h2>PlantCare</h2>

        <p>Reset your password:</p>

        <a href="${resetUrl}">
            Reset Password
        </a>

        `

    });

};


module.exports = sendResetEmail;