const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const profile = async (req, res) => {


    try {


        const user = await User.findById(
            req.user.id
        );


        if (!user) {

            return res.status(404).json({

                success: false,
                message: "User not found"

            });

        }


        res.json({

            success: true,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image
            }

        });



    } catch (error) {


        console.log(error);


        res.status(500).json({

            success: false,
            message: "Server error"

        });


    }


};
const getUsers = async (req, res) => {

    try {


        const page = parseInt(req.query.page) || 1;

        const limit = Math.min(
            parseInt(req.query.limit) || 10,
            50
        );

        const offset = (page - 1) * limit;



        const users = await User.findAllPaginated(
            limit,
            offset
        );


        const totalUsers = await User.countUsers();



        res.json({

            success: true,

            pagination: {
                page,
                limit,
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit)
            },

            users

        });



    } catch (error) {

        console.log(error);


        res.status(500).json({

            success: false,
            message: "Server error"

        });

    }

};






const updateProfile = async (req, res) => {

    try {


        const {
            name,
            email
        } = req.body;


        const user =
            await User.updateProfile(
                req.user.id,
                {
                    name,
                    email
                }
            );


        res.json({

            success: true,

            user

        });


    } catch (error) {

        console.log(error);


        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


const deleteAccount = async (req, res) => {


    try {


        await User.delete(
            req.user.id
        );


        res.json({

            success: true,

            message: "Account deleted"

        });


    } catch (error) {


        res.status(500).json({

            success: false,

            message: error.message

        });

    }


};
const changePassword = async (req, res) => {

    try {

        const {
            oldPassword,
            newPassword
        } = req.body;


        const user =
            await User.findById(req.user.id);


        if (!user) {

            return res.status(404).json({

                success: false,
                message: "User not found"

            });

        }

        if (!oldPassword || !newPassword) {

            return res.status(400).json({

                success: false,

                message: "Old password and new password are required"

            });

        }


        if (!user.password) {

            return res.status(400).json({

                success: false,

                message: "Password not found"

            });

        }

        const isMatch =
            await bcrypt.compare(
                oldPassword,
                user.password
            );


        if (!isMatch) {

            return res.status(400).json({

                success: false,
                message: "Old password incorrect"

            });

        }


        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );


        await User.updatePassword(

            req.user.id,

            hashedPassword

        );


        res.json({

            success: true,

            message: "Password updated"

        });


    } catch (error) {


        console.log(error);


        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {
    profile,
    getUsers,
    updateProfile,
    deleteAccount,
    changePassword
};