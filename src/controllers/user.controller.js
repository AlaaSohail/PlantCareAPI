const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const Plant = require("../models/plant.model");

const AIAnalysis =
    require("../models/ai.model");


const {
    deleteImage,
    uploadImage
} = require("../services/cloudinary.service");

const getLocationDetails =
    require("../services/location.service");


const updateLocation = async (req, res) => {

    try {

        const {
            latitude,
            longitude
        } = req.body;


        if (!latitude || !longitude) {

            return res.status(400).json({

                success: false,

                message: "Latitude and longitude are required"

            });

        }


        const locationDetails =
            await getLocationDetails(
                latitude,
                longitude
            );


        const user =
            await User.updateLocation(
                req.user.id,
                {
                    latitude,
                    longitude,
                    country:
                        locationDetails.country,

                    city:
                        locationDetails.city
                }
            );


        res.json({

            success: true,

            message: "Location updated successfully",

            user

        });


    } catch (error) {

        console.log(
            "UPDATE LOCATION ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const profile = async (req, res) => {

    try {


        const user =
            await User.findById(
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

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};



const getUsers = async (req, res) => {

    try {

        const page =
            parseInt(req.query.page) || 1;


        const limit = Math.min(
            parseInt(req.query.limit) || 10,
            50
        );


        const offset =
            (page - 1) * limit;



        const users =
            await User.findAllPaginated(
                limit,
                offset
            );


        const totalUsers =
            await User.countUsers();



        res.json({

            success: true,

            pagination: {

                page,

                limit,

                totalUsers,

                totalPages:
                    Math.ceil(
                        totalUsers / limit
                    )

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
            email,
            phoneNumber,
            location
        } = req.body;


        const user = await User.findById(
            req.user.id
        );


        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        // الاحتفاظ بالقيم القديمة إذا لم يتم إرسالها
        const updatedName =
            name !== undefined
                ? name.trim()
                : user.name;


        const updatedEmail =
            email !== undefined
                ? email.trim().toLowerCase()
                : user.email;


        const updatedPhone =
            phoneNumber !== undefined
                ? phoneNumber.trim()
                : user.phone_number;


        const updatedLocation =
            location !== undefined
                ? location
                : user.location;


        let updatedImage =
            user.user_image;


        // إذا تم اختيار صورة جديدة
        if (req.file) {

            // رفع الصورة الجديدة
            const uploadedImage =
                await uploadImage(
                    req.file.buffer
                );


            updatedImage =
                uploadedImage.secure_url;


            // حذف الصورة القديمة
            if (user.user_image) {

                await deleteImage(
                    user.user_image
                );

            }

        }


        // تحديث قاعدة البيانات
        const updatedUser =
            await User.updateProfile(
                req.user.id,
                {
                    name: updatedName,
                    email: updatedEmail,
                    phoneNumber: updatedPhone,
                    location: updatedLocation,
                    userImage: updatedImage
                }
            );


        res.json({

            success: true,

            message:
                "Profile updated successfully",

            user: {

                id:
                    updatedUser.id,

                name:
                    updatedUser.name,

                email:
                    updatedUser.email,

                phoneNumber:
                    updatedUser.phone_number,

                userImage:
                    updatedUser.user_image,

                location:
                    updatedUser.location,

                latitude:
                    updatedUser.latitude,

                longitude:
                    updatedUser.longitude,

                country:
                    updatedUser.country,

                city:
                    updatedUser.city
            }

        });


    } catch (error) {

        console.log(
            "UPDATE PROFILE ERROR:",
            error
        );


        // Duplicate email
        if (error.code === "23505") {

            return res.status(409).json({

                success: false,

                message:
                    "Email is already in use"

            });

        }


        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }
};




// Delete Account
const deleteAccount = async (req, res) => {

    try {


        const userId =
            req.user.id;



        // جلب نباتات المستخدم
        const plants =
            await Plant.findByUser(
                userId
            );





        for (const plant of plants) {





            // حذف صورة النبتة
            if (plant.image_url) {





                await deleteImage(
                    plant.image_url
                );

            }



            // حذف صور AI Analysis
            const images =
                await AIAnalysis.findImagesByPlant(
                    plant.id
                );



            for (const image of images) {


                if (image.image_url) {





                    await deleteImage(
                        image.image_url
                    );

                }

            }



            // حذف تحليلات AI
            await AIAnalysis.deleteByPlant(
                plant.id
            );



            // حذف النبتة
            await Plant.delete(
                plant.id,
                userId
            );


        }




        // حذف المستخدم
        await User.delete(
            userId
        );



        res.json({

            success: true,

            message:
                "Account and all data deleted successfully"

        });



    } catch (error) {


        console.log(error);


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
            await User.findById(
                req.user.id
            );



        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }



        if (!oldPassword || !newPassword) {

            return res.status(400).json({

                success: false,

                message:
                    "Old password and new password are required"

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

                message:
                    "Old password incorrect"

            });

        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters"
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

    changePassword,

    updateLocation,


};