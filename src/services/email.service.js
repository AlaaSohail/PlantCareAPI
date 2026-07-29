const { Resend } = require("resend");


const resend = new Resend(
    process.env.RESEND_API_KEY
);



const sendResetEmail = async (
    email,
    token
) => {


    const resetUrl =
        `https://your-frontend.com/reset-password?token=${token}`;



    await resend.emails.send({

        from: "PlantCare <noreply@alaasohail.com>",

        to: email,

        subject: "Reset your PlantCare password",

        html: `
        <h2>PlantCare</h2>

        <p>
        Click below to reset your password:
        </p>

        <a href="${resetLink}">
            Reset Password
        </a>
    `

    });


};


module.exports = sendResetEmail;