const cloudinary = require("../config/cloudinary");


const deleteImage = async (imageUrl) => {

    try {

        if (!imageUrl) return;


        const parts = imageUrl.split("/");


        const fileName =
            parts[parts.length - 1];


        const publicId =
            "plantcare/" + fileName.split(".")[0];


        await cloudinary.uploader.destroy(
            publicId
        );


        console.log(
            "Deleted from Cloudinary:",
            publicId
        );


    } catch(error) {

        console.log(
            "Cloudinary delete error:",
            error.message
        );

    }

};


module.exports = {
    deleteImage
};