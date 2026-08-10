const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send password reset email
 */
const sendResetEmail = async (email, token) => {
    const resetLink =
        `https://alaasohail.com/reset-password?token=${encodeURIComponent(token)}`;

    const result = await resend.emails.send({
        from: "PlantCare <noreply@alaasohail.com>",
        to: email,
        subject: "Reset your PlantCare password",

        html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 40px auto;
        padding: 30px;
        background: #ffffff;
        border-radius: 16px;
      ">

        <h2 style="color:#2e7d32;">
          🌱 PlantCare
        </h2>

        <p>
          You requested to reset your password.
        </p>

        <a
          href="${resetLink}"
          style="
            display:inline-block;
            padding:12px 24px;
            background:#2e7d32;
            color:white;
            text-decoration:none;
            border-radius:8px;
          "
        >
          Reset Password
        </a>

      </div>
    `,
    });

    console.log("Password reset email:", result);
};


/**
 * Send email verification
 */
const sendVerificationEmail = async (
    email,
    name,
    verificationToken
) => {

    const verificationLink =
        `https://api.alaasohail.com/api/auth/verify-email?token=${encodeURIComponent(
            verificationToken
        )}`;

    const result = await resend.emails.send({

        from:
            "PlantCare <noreply@alaasohail.com>",

        to: email,

        subject:
            "Verify your PlantCare email 🌱",

        html: `
      <!DOCTYPE html>

      <html>

      <head>
        <meta charset="UTF-8">

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        >
      </head>

      <body style="
        margin:0;
        padding:0;
        background:#f4f7f4;
        font-family:Arial,sans-serif;
      ">

        <div style="
          max-width:600px;
          margin:40px auto;
          background:white;
          border-radius:20px;
          overflow:hidden;
        ">

          <!-- Header -->

          <div style="
            background:#2e7d32;
            color:white;
            padding:30px;
            text-align:center;
          ">

            <h1 style="margin:0;">
              🌱 PlantCare
            </h1>

            <p>
              Welcome to PlantCare
            </p>

          </div>


          <!-- Content -->

          <div style="
            padding:35px;
          ">

            <h2>
              Hello ${name} 👋
            </h2>

            <p style="
              font-size:16px;
              line-height:1.6;
            ">

              Thank you for creating a PlantCare account.

            </p>

            <p style="
              font-size:16px;
              line-height:1.6;
            ">

              Please verify your email address
              by clicking the button below.

            </p>


            <div style="
              text-align:center;
              margin:35px 0;
            ">

              <a
                href="${verificationLink}"

                style="
                  display:inline-block;
                  padding:14px 30px;
                  background:#2e7d32;
                  color:white;
                  text-decoration:none;
                  border-radius:10px;
                  font-size:16px;
                  font-weight:bold;
                "
              >

                Verify My Email

              </a>

            </div>


            <p style="
              color:#777;
              font-size:14px;
              line-height:1.6;
            ">

              This verification link will expire
              in 24 hours.

            </p>


            <p style="
              color:#777;
              font-size:14px;
              line-height:1.6;
            ">

              If you did not create a PlantCare account,
              you can safely ignore this email.

            </p>

          </div>


          <!-- Footer -->

          <div style="
            background:#f5f5f5;
            padding:20px;
            text-align:center;
            color:#888;
            font-size:13px;
          ">

            © PlantCare

          </div>

        </div>

      </body>

      </html>
    `,
    });

    console.log("Verification email:", result);

    return result;
};
const sendResetCodeEmail = async (
    email,
    name,
    code
) => {

    const result = await resend.emails.send({

        from:
            "PlantCare <noreply@alaasohail.com>",

        to: email,

        subject:
            "Your PlantCare password reset code",

        html: `
        <!DOCTYPE html>

        <html>

        <head>
            <meta charset="UTF-8">
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >
        </head>

        <body style="
            margin:0;
            padding:0;
            background:#f4f7f4;
            font-family:Arial,sans-serif;
        ">

            <div style="
                max-width:600px;
                margin:40px auto;
                background:white;
                border-radius:20px;
                overflow:hidden;
            ">

                <div style="
                    background:#2e7d32;
                    color:white;
                    padding:30px;
                    text-align:center;
                ">

                    <h1 style="margin:0;">
                        🌱 PlantCare
                    </h1>

                </div>

                <div style="padding:35px;">

                    <h2>
                        Hello ${name} 👋
                    </h2>

                    <p style="
                        font-size:16px;
                        line-height:1.6;
                    ">

                        We received a request to reset
                        your PlantCare password.

                    </p>

                    <p style="
                        font-size:16px;
                        line-height:1.6;
                    ">

                        Your verification code is:

                    </p>

                    <div style="
                        text-align:center;
                        margin:30px 0;
                    ">

                        <span style="
                            display:inline-block;
                            padding:18px 30px;
                            background:#f0f7f0;
                            color:#2e7d32;
                            border-radius:12px;
                            font-size:32px;
                            font-weight:bold;
                            letter-spacing:8px;
                        ">

                            ${code}

                        </span>

                    </div>

                    <p style="
                        color:#777;
                        font-size:14px;
                        line-height:1.6;
                    ">

                        This code will expire in
                        <strong>15 minutes</strong>.

                    </p>

                    <p style="
                        color:#777;
                        font-size:14px;
                        line-height:1.6;
                    ">

                        If you did not request a password reset,
                        you can safely ignore this email.

                    </p>

                </div>

                <div style="
                    background:#f5f5f5;
                    padding:20px;
                    text-align:center;
                    color:#888;
                    font-size:13px;
                ">

                    © PlantCare

                </div>

            </div>

        </body>

        </html>
        `
    });

    console.log(
        "Password reset code email:",
        result
    );

    return result;
};

module.exports = {
    sendResetEmail,
    sendVerificationEmail,
    sendResetCodeEmail
};