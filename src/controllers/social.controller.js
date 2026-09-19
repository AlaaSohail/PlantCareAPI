const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");


const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);


// =====================================================
// GOOGLE LOGIN
// =====================================================

const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Google token is required"
            });
        }

        console.log("1. Google token received");

        console.log(
            "GOOGLE_CLIENT_ID:",
            JSON.stringify(process.env.GOOGLE_CLIENT_ID)
        );

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        console.log("2. Google token verified");

        const payload = ticket.getPayload();

        console.log("Google AUD:", payload.aud);
        console.log("Google AZP:", payload.azp);
        console.log("Google email:", payload.email);

        const googleId = payload.sub;
        const email = payload.email?.trim()?.toLowerCase();
        const name = payload.name || "Google User";
        const picture = payload.picture || null;

        if (!googleId || !email) {
            return res.status(401).json({
                success: false,
                message: "Invalid Google account information"
            });
        }

        console.log("3. Searching by Google ID");

        let user = await User.findByGoogleId(googleId);

        console.log("4. findByGoogleId result:", user);

        if (!user) {
            console.log("5. Searching by email:", email);

            user = await User.findByEmail(email);

            console.log("6. findByEmail result:", user);

            if (user) {
                if (
                    user.provider === "local" &&
                    user.password
                ) {
                    return res.status(409).json({
                        success: false,
                        message:
                            "An account already exists with this email. Please login using your email and password."
                    });
                }

                console.log("7. Updating Google ID");

                await User.updateGoogleId(
                    user.id,
                    googleId
                );

                user = await User.findById(user.id);
            } else {
                console.log("8. Creating Google user");

                user = await User.create({
                    name,
                    email,
                    password: null,
                    provider: "google",
                    userImage: picture,
                    emailVerified: true,
                    googleId
                });

                console.log("9. User created:", user);
            }
        }

        console.log("10. Creating application JWT");

        const jwtToken = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "30d"
            }
        );

        console.log("11. Google login completed");

        return res.json({
            success: true,
            message: "Google login successful",
            token: jwtToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phone_number,
                userImage: user.user_image,
                latitude: user.latitude,
                longitude: user.longitude,
                country: user.country,
                city: user.city
            }
        });

    } catch (error) {
    console.error("========== GOOGLE LOGIN ERROR ==========");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Detail:", error.detail);
    console.error("Stack:", error.stack);

    return res.status(401).json({
        success: false,
        message: "Google login failed",
        error: error.message
    });
}
};
// =====================================================
// FACEBOOK LOGIN
// =====================================================

const facebookLogin = async (req, res) => {

    try {

        const { token } = req.body;


        // ============================================
        // Validate token
        // ============================================

        if (!token) {

            return res.status(400).json({

                success: false,

                message: "Facebook token is required"

            });

        }


        // ============================================
        // Get Facebook App Access Token
        // ============================================

        const appTokenResponse =
            await axios.get(
                "https://graph.facebook.com/oauth/access_token",
                {
                    params: {

                        client_id:
                            process.env.FACEBOOK_APP_ID,

                        client_secret:
                            process.env.FACEBOOK_APP_SECRET,

                        grant_type:
                            "client_credentials"

                    }
                }
            );


        const appAccessToken =
            appTokenResponse.data.access_token;


        // ============================================
        // Debug / Validate User Token
        // ============================================

        const debugResponse =
            await axios.get(
                "https://graph.facebook.com/debug_token",
                {
                    params: {

                        input_token: token,

                        access_token:
                            appAccessToken

                    }
                }
            );


        const debugData =
            debugResponse.data.data;


        // ============================================
        // Validate token
        // ============================================

        if (!debugData.is_valid) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid Facebook token or token has expired"

            });

        }


        // Make sure token belongs to our app

        if (
            String(debugData.app_id) !==
            String(process.env.FACEBOOK_APP_ID)
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Facebook token does not belong to this app"

            });

        }


        const facebookId =
            debugData.user_id;


        // ============================================
        // Get Facebook User Information
        // ============================================

        const userResponse =
            await axios.get(
                `https://graph.facebook.com/${facebookId}`,
                {
                    params: {

                        fields:
                            "id,name,email,picture",

                        access_token:
                            token

                    }
                }
            );


        const facebookUser =
            userResponse.data;


        const email =
            facebookUser.email
                ?.trim()
                ?.toLowerCase();

        const name =
            facebookUser.name ||
            "Facebook User";


        const picture =
            facebookUser.picture
                ?.data
                ?.url || null;


        // ============================================
        // Find by Facebook ID
        // ============================================

        let user =
            await User.findByFacebookId(
                facebookId
            );


        // ============================================
        // Facebook ID not found
        // ============================================

        if (!user) {

            // ----------------------------------------
            // Try email
            // ----------------------------------------

            if (email) {

                user =
                    await User.findByEmail(
                        email
                    );

            }


            // ----------------------------------------
            // Existing account
            // ----------------------------------------

            if (user) {

                if (
                    user.provider === "local" &&
                    user.password
                ) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "An account already exists with this email. Please login using your email and password."

                    });

                }


                await User.updateFacebookId(
                    user.id,
                    facebookId
                );


                user =
                    await User.findById(
                        user.id
                    );

            }


            // ----------------------------------------
            // Create new Facebook account
            // ----------------------------------------

            else {

                if (!email) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Facebook did not provide an email address."

                    });

                }


                user =
                    await User.create({

                        name,

                        email,

                        password: null,

                        provider: "facebook",

                        userImage:
                            picture,

                        emailVerified: true,

                        facebookId

                    });

            }

        }


        // ============================================
        // Create PlantCare JWT
        // ============================================

        const jwtToken =
            jwt.sign(

                {
                    id: user.id,

                    email: user.email

                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "30d"
                }

            );


        // ============================================
        // Response
        // ============================================

        return res.json({

            success: true,

            message:
                "Facebook login successful",

            token: jwtToken,

            user: {

                id: user.id,

                name: user.name,

                email: user.email,

                phoneNumber:
                    user.phone_number,

                userImage:
                    user.user_image,

                latitude:
                    user.latitude,

                longitude:
                    user.longitude,

                country:
                    user.country,

                city:
                    user.city

            }

        });


    } catch (error) {

        console.log(
            "FACEBOOK LOGIN ERROR:",
            error.response?.data ||
            error.message
        );


        return res.status(401).json({

            success: false,

            message:
                "Facebook login failed"

        });

    }

};

module.exports = {

    googleLogin,

    facebookLogin

};