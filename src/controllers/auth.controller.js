const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Token = require("../models/token.model");
const sendResetEmail =
    require("../services/email.service");
const register = async (req, res) => {

    try {

        const { name, email, password } = req.body || {};;


        // التحقق من البيانات
        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }


        // هل المستخدم موجود؟
        const existingUser = await User.findByEmail(email);


        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });

        }



        const hashedPassword = await bcrypt.hash(password, 10);



        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });


        res.status(201).json({

            success: true,
            message: "User created successfully",

            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }

        });



    } catch (error) {

        console.log("REGISTER ERROR:", error);

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};




const login = async (req, res) => {

    try {

        const { email, password } = req.body;


        const user = await User.findByEmail(email);


        if (!user) {

            return res.status(404).json({

                success: false,
                message: "User not found"

            });

        }


        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isMatch) {

            return res.status(401).json({

                success: false,
                message: "Invalid password"

            });

        }


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



        res.json({

            success: true,
            message: "Login successful",

            token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }

        });


    }
    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: error.message


        });

    }

};





const logout = async (req, res) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {

            return res.status(401).json({
                success: false,
                message: "Token required"
            });

        }

        const token = authHeader.split(" ")[1];


        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        const expiresAt = new Date(decoded.exp * 1000);

        await Token.blacklist(
            token,
            expiresAt
        );

        res.json({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {


        res.status(401).json({
            success: false,
            message: "Invalid token"
        });

    }

};

const crypto = require("crypto");

const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Email not found"
            });
        }

        const token = crypto.randomBytes(32).toString("hex");

        const expire = new Date(Date.now() + 15 * 60 * 1000);

        await User.saveResetToken(
            email,
            token,
            expire
        );

        await sendResetEmail(
            email,
            token
        );

        res.json({
            success: true,
            message: "Reset token created",
            token
        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

};

const resetPassword = async (req, res) => {

    try {


        const {
            token,
            password
        } = req.body;


        const user =
            await User.findByResetToken(token);


        if (!user) {

            return res.status(400).json({

                success: false,
                message: "Invalid token"

            });

        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        await User.updatePassword(
            user.id,
            hashedPassword
        );


        res.json({

            success: true,
            message: "Password updated"

        });


    }
    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server error"

        });

    }

};
module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
    logout
};