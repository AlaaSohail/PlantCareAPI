const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");


const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);



const googleLogin = async (req, res) => {

    try {


        const { token } = req.body;


        const ticket =
            await client.verifyIdToken({

                idToken: token,

                audience:
                    process.env.GOOGLE_CLIENT_ID

            });


        const payload =
            ticket.getPayload();


        const email = payload.email;
        const name = payload.name;



        let user =
            await User.findByEmail(email);



        if (!user) {


            user =
                await User.create({

                    name,

                    email,

                    password: null,

                    provider: "google"

                });


        }



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



        res.json({

            success: true,

            token: jwtToken,

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

            message: "Google login failed"

        });


    }


};


module.exports = {
    googleLogin
};