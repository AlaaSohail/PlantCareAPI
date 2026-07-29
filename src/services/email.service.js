const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASSWORD

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

        <div style="font-family:Arial">

            <h2>PlantCare</h2>

            <p>
            You requested to reset your password.
            </p>

            <a href="${resetUrl}">
                Reset Password
            </a>

            <p>
            This link expires after 15 minutes.
            </p>

        </div>

        `

    });


};


module.exports = sendResetEmail;