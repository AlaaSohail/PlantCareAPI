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


        // ============================================
        // Validate token
        // ============================================

        if (!token) {

            return res.status(400).json({

                success: false,

                message: "Google token is required"

            });

        }


        // ============================================
        // Verify Google token
        // ============================================

        const ticket =
            await client.verifyIdToken({

                idToken: token,

                audience:
                    process.env.GOOGLE_CLIENT_ID

            });


        const payload =
            ticket.getPayload();


        const googleId =
            payload.sub;

        const email =
            payload.email
                ?.trim()
                ?.toLowerCase();

        const name =
            payload.name ||
            "Google User";

        const picture =
            payload.picture || null;


        if (!googleId || !email) {

            return res.status(401).json({

                success: false,

                message: "Invalid Google account"

            });

        }


        // ============================================
        // Find by Google ID
        // ============================================

        let user =
            await User.findByGoogleId(
                googleId
            );


        // ============================================
        // If Google ID not found
        // ============================================

        if (!user) {

            // ----------------------------------------
            // Check existing email
            // ----------------------------------------

            user =
                await User.findByEmail(
                    email
                );


            // ----------------------------------------
            // Existing account
            // ----------------------------------------

            if (user) {

                /*
                 * IMPORTANT:
                 *
                 * We don't automatically link Google
                 * to an existing local account.
                 *
                 * This prevents account takeover if
                 * the email/provider configuration
                 * is not what we expect.
                 */

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


                // ------------------------------------
                // Existing social account
                // ------------------------------------

                await User.updateGoogleId(
                    user.id,
                    googleId
                );

                user =
                    await User.findById(
                        user.id
                    );

            }


            // ----------------------------------------
            // Create new Google account
            // ----------------------------------------

            else {

                user =
                    await User.create({

                        name,

                        email,

                        password: null,

                        provider: "google",

                        userImage: picture,

                        emailVerified: true,

                        googleId

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
                    expiresIn: "7d"
                }

            );


        // ============================================
        // Response
        // ============================================

        return res.json({

            success: true,

            message: "Google login successful",

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
            "GOOGLE LOGIN ERROR:",
            error
        );


        return res.status(401).json({

            success: false,

            message: "Google login failed"

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
                    "Invalid Facebook token"

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
                    expiresIn: "7d"
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