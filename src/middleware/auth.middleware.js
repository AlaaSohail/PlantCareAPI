const jwt = require("jsonwebtoken");
const Token = require("../models/token.model");


const authMiddleware = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;


        if (!authHeader) {

            return res.status(401).json({

                success: false,
                message: "No token provided"

            });

        }


        const parts = authHeader.split(" ");


        if (parts.length !== 2 || parts[0] !== "Bearer") {

            return res.status(401).json({

                success: false,
                message: "Invalid authorization format"

            });

        }


        const token = parts[1];

        console.log("TOKEN RECEIVED:", token);

        console.log(
            "JWT SECRET:",
            process.env.JWT_SECRET
        );


        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("DECODED:", decoded);


        // فحص هل تم تسجيل الخروج بهذا الـ Token
        const blacklisted = await Token.isBlacklisted(token);


        if (blacklisted) {

            return res.status(401).json({

                success: false,
                message: "Token has been logged out"

            });

        }


        console.log("TOKEN:", token);
        console.log("SECRET:", process.env.JWT_SECRET);
        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );


        req.user = decoded;


        next();


    } catch (error) {

        console.log("JWT ERROR:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });

    }

};


module.exports = authMiddleware;