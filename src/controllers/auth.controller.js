const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user.model");
const Token = require("../models/token.model");

const {
    sendResetEmail,
    sendResetCodeEmail,
    sendVerificationEmail,
} = require("../services/email.service");

const getLocationDetails =
    require("../services/location.service");


// =====================================================
// REGISTER
// =====================================================

const register = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            confirmPassword,
            phoneNumber,
            userImage,
            latitude,
            longitude,
            fcm_token
        } = req.body || {};


        // ============================================
        // Validate fields
        // ============================================

        if (
            !name ||
            !email ||
            !password ||
            !confirmPassword
        ) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }


        // ============================================
        // Confirm password
        // ============================================

        if (password !== confirmPassword) {

            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });

        }


        // ============================================
        // Normalize email
        // ============================================

        const normalizedEmail =
            email.trim().toLowerCase();


        // ============================================
        // Check existing user
        // ============================================

        const existingUser =
            await User.findByEmail(normalizedEmail);


        if (existingUser) {

            // Already verified
            if (existingUser.email_verified) {

                return res.status(400).json({
                    success: false,
                    message: "Email already exists"
                });

            }


            // Account exists but not verified
            return res.status(400).json({
                success: false,
                message:
                    "Email already registered but not verified. Please verify your email."
            });

        }


        // ============================================
        // Hash password
        // ============================================

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // ============================================
        // Location
        // ============================================

        const locationDetails =
            await getLocationDetails(
                latitude,
                longitude
            );


        // ============================================
        // Verification token
        // ============================================

        const verificationToken =
            crypto.randomBytes(32).toString("hex");


        const verificationExpires =
            new Date(
                Date.now() + 24 * 60 * 60 * 1000
            );


        // ============================================
        // Create user
        // ============================================

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,

            phoneNumber: phoneNumber || null,
            userImage: userImage || null,

            latitude: latitude ?? null,
            longitude: longitude ?? null,

            country: locationDetails?.country ?? null,
            city: locationDetails?.city ?? null,

            fcm_token: fcm_token || null,

            emailVerified: false,

            emailVerificationToken:
                verificationToken,

            emailVerificationExpires:
                verificationExpires
        });


        // ============================================
        // Send verification email
        // ============================================

        try {

            await sendVerificationEmail(
                user.email,
                user.name,
                verificationToken
            );

        } catch (emailError) {

            console.log(
                "VERIFICATION EMAIL ERROR:",
                emailError
            );

            return res.status(500).json({
                success: false,
                message:
                    "Account created but verification email could not be sent"
            });

        }


        // ============================================
        // Response
        // ============================================

        return res.status(201).json({

            success: true,

            message:
                "Account created successfully. Please verify your email.",

            emailVerified: false,

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
            "REGISTER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// VERIFY EMAIL
// =====================================================

const verifyEmail = async (req, res) => {

    try {

        const { token } = req.query;


        if (!token) {

            return res.status(400).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Invalid Link</title>
                </head>

                <body style="
                    font-family: Arial;
                    text-align: center;
                    padding: 60px;
                    background: #f5f7f5;
                ">

                    <h1>❌ Invalid Verification Link</h1>

                    <p>
                        Verification token is missing.
                    </p>

                </body>
                </html>
            `);

        }


        // ============================================
        // Find user
        // ============================================

        const user =
            await User.findByVerificationToken(token);


        if (!user) {

            return res.status(400).send(`
                <!DOCTYPE html>
                <html>

                <body style="
                    font-family: Arial;
                    text-align: center;
                    padding: 60px;
                    background: #f5f7f5;
                ">

                    <h1>❌ Invalid Link</h1>

                    <p>
                        This verification link is invalid
                        or has already been used.
                    </p>

                </body>

                </html>
            `);

        }


        // ============================================
        // Check expiration
        // ============================================

        if (
            user.email_verification_expires &&
            new Date(
                user.email_verification_expires
            ) < new Date()
        ) {

            return res.status(400).send(`
                <!DOCTYPE html>

                <html>

                <body style="
                    font-family: Arial;
                    text-align: center;
                    padding: 60px;
                    background: #f5f7f5;
                ">

                    <h1>⏰ Link Expired</h1>

                    <p>
                        Your verification link has expired.
                    </p>

                    <p>
                        Please request a new verification email.
                    </p>

                </body>

                </html>
            `);

        }


        // ============================================
        // Verify email
        // ============================================

        await User.verifyEmail(user.id);


        // ============================================
        // Success page
        // ============================================

        return res.status(200).send(`
            <!DOCTYPE html>

            <html>

            <head>

                <meta charset="UTF-8">

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                >

                <title>Email Verified</title>

            </head>


            <body style="
                margin: 0;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                background: #f5f7f5;
                font-family: Arial, sans-serif;
            ">


                <div style="
                    background: white;
                    padding: 45px 30px;
                    max-width: 500px;
                    margin: 20px;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow:
                        0 5px 25px
                        rgba(0,0,0,0.08);
                ">


                    <div style="
                        font-size: 70px;
                    ">
                        🌱
                    </div>


                    <h1 style="
                        color: #2e7d32;
                    ">
                        Email Verified!
                    </h1>


                    <p style="
                        color: #666;
                        line-height: 1.6;
                        font-size: 16px;
                    ">

                        Your PlantCare account
                        has been successfully verified.

                    </p>


                    <p style="
                        color: #666;
                        line-height: 1.6;
                    ">

                        You can now return to
                        the PlantCare application
                        and login.

                    </p>


                </div>

            </body>

            </html>
        `);


    } catch (error) {

        console.log(
            "VERIFY EMAIL ERROR:",
            error
        );

        return res.status(500).send(`
            <!DOCTYPE html>

            <html>

            <body style="
                font-family: Arial;
                text-align: center;
                padding: 60px;
            ">

                <h1>
                    ❌ Something went wrong
                </h1>

                <p>
                    Please try again later.
                </p>

            </body>

            </html>
        `);

    }

};


// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        const user =
            await User.findByEmail(
                email.trim().toLowerCase()
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        // ============================================
        // CHECK EMAIL VERIFICATION
        // ============================================

        if (!user.email_verified) {

            return res.status(403).json({

                success: false,

                message:
                    "Please verify your email before logging in.",

                emailVerified: false,

                email: user.email

            });

        }


        // ============================================
        // Password
        // ============================================

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid password"

            });

        }


        // ============================================
        // JWT
        // ============================================

        const token =
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
                "Login successful",

            token,

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
            "LOGIN ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// RESEND VERIFICATION
// =====================================================

const resendVerificationEmail = async (req, res) => {

    try {

        const { email } = req.body;


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required"

            });

        }


        const normalizedEmail =
            email.trim().toLowerCase();


        const user =
            await User.findByEmail(
                normalizedEmail
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        if (user.email_verified) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is already verified"

            });

        }


        const verificationToken =
            crypto.randomBytes(32).toString("hex");


        const verificationExpires =
            new Date(
                Date.now() + 24 * 60 * 60 * 1000
            );


        await User.updateVerificationToken(

            user.id,

            verificationToken,

            verificationExpires

        );


        await sendVerificationEmail(

            user.email,

            user.name,

            verificationToken

        );


        return res.json({

            success: true,

            message:
                "Verification email sent successfully"

        });


    } catch (error) {

        console.log(
            "RESEND VERIFICATION ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to send verification email"

        });

    }

};


// =====================================================
// LOGOUT
// =====================================================

const logout = async (req, res) => {

    try {

        const authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Token required"

            });

        }


        const token =
            authHeader.split(" ")[1];


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        const expiresAt =
            new Date(
                decoded.exp * 1000
            );


        await Token.blacklist(
            token,
            expiresAt
        );


        return res.json({

            success: true,

            message:
                "Logout successful"

        });


    } catch (error) {

        return res.status(401).json({

            success: false,

            message:
                "Invalid token"

        });

    }

};


// =====================================================
// FORGOT PASSWORD
// =====================================================

const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({
                success: false,
                message: "Email is required"
            });

        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await User.findByEmail(normalizedEmail);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "Email not found"
            });

        }

        // ============================================
        // Generate 6-digit reset code
        // ============================================

        const resetCode =
            Math.floor(
                100000 + Math.random() * 900000
            ).toString();

        // ============================================
        // Code expires after 15 minutes
        // ============================================

        const resetCodeExpire =
            new Date(
                Date.now() + 15 * 60 * 1000
            );

        // ============================================
        // Save code
        // ============================================

        await User.saveResetCode(
            normalizedEmail,
            resetCode,
            resetCodeExpire
        );

        // ============================================
        // Send email
        // ============================================

        await sendResetCodeEmail(
            normalizedEmail,
            user.name,
            resetCode
        );

        // ============================================
        // Response
        // ============================================

        return res.json({

            success: true,

            message:
                "Password reset code sent successfully",

            email: normalizedEmail

        });

    } catch (error) {

        console.log("FORGOT PASSWORD ERROR:", error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const verifyResetCode = async (req, res) => {

    try {

        const {
            email,
            code
        } = req.body;

        if (!email || !code) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and code are required"

            });

        }

        const normalizedEmail =
            email.trim().toLowerCase();

        // ============================================
        // Find user using email + code
        // ============================================

        const user =
            await User.findByResetCode(
                normalizedEmail,
                code
            );

        if (!user) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid or expired verification code"

            });

        }

        // ============================================
        // Code is valid
        // ============================================

        return res.json({

            success: true,

            message:
                "Verification code is valid"

        });

    } catch (error) {

        console.log(
            "VERIFY RESET CODE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error"

        });

    }

};
// =====================================================
// RESET PASSWORD
// =====================================================


const resetPassword = async (req, res) => {

    try {

        const {
            email,
            code,
            password
        } = req.body;

        // ============================================
        // Validate fields
        // ============================================

        if (!email || !code || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email, code and password are required"

            });

        }

        // ============================================
        // Normalize email
        // ============================================

        const normalizedEmail =
            email.trim().toLowerCase();

        // ============================================
        // Find user using email + code
        // ============================================

        const user =
            await User.findByResetCode(
                normalizedEmail,
                code
            );

        if (!user) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid or expired reset code"

            });

        }

        // ============================================
        // Hash new password
        // ============================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        // ============================================
        // Update password
        // ============================================

        await User.updatePassword(
            user.id,
            hashedPassword
        );

        // ============================================
        // Response
        // ============================================

        return res.json({

            success: true,

            message:
                "Password updated successfully"

        });

    } catch (error) {

        console.log(
            "RESET PASSWORD ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error"

        });

    }

};




// =====================================================
// EXPORT
// =====================================================

module.exports = {

    register,

    login,

    verifyEmail,

    resendVerificationEmail,

    forgotPassword,

    resetPassword,

    logout,

    verifyResetCode

};