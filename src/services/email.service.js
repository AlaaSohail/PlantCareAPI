const { Resend } = require("resend");


const resend = new Resend(
    process.env.RESEND_API_KEY
);



const sendResetEmail = async (email, token) => {


    const resetLink =
        `https://alaasohail.com/reset-password?token=${token}`;



    const result =
        await resend.emails.send({

            from:
            "PlantCare <noreply@alaasohail.com>",

            to: email,

            subject:
            "Reset your PlantCare password",

            html: `

            <h2>PlantCare</h2>

            <p>
            You requested to reset your password.
            </p>


            <a href="${resetLink}">
                Reset Password
            </a>


            `

        });


    console.log(result);


};


module.exports = sendResetEmail;