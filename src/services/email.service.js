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

        from: "PlantCare <onboarding@resend.dev>",

        to: email,

        subject: "Reset your PlantCare password",

        html: `

        <h2>PlantCare</h2>

        <p>
        You requested a password reset.
        </p>


        <a href="${resetUrl}">
            Reset Password
        </a>

        `

    });


};


module.exports = sendResetEmail;