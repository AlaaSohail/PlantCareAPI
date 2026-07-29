const cloudinary = require("../config/cloudinary");


const deleteImage = async (imageUrl) => {

    try {

        if (!imageUrl) return;


        const parts = imageUrl.split("/");


        const fileName =
            parts[parts.length - 1];


        const publicId =
            "plantcare/" + fileName.split(".")[0];


        console.log("IMAGE URL:", imageUrl);

        console.log("PUBLIC ID:", publicId);



        const result =
            await cloudinary.uploader.destroy(
                publicId
            );


        console.log(
            "CLOUDINARY RESULT:",
            result
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