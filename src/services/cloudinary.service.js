const cloudinary = require("../config/cloudinary");


const deleteImage = async (imageUrl) => {

    try {

        if (!imageUrl) return;


        let publicId;


        if (imageUrl.startsWith("http")) {


            const urlParts =
                imageUrl.split("/");


            const uploadIndex =
                urlParts.indexOf("upload");


            const pathAfterUpload =
                urlParts.slice(uploadIndex + 2)
                    .join("/");


            publicId =
                pathAfterUpload
                    .replace(/\.[^/.]+$/, "");


        } else {

            publicId = imageUrl;

        }



        console.log(
            "Deleting public_id:",
            publicId
        );



        const result =
            await cloudinary.uploader.destroy(
                publicId
            );


        console.log(
            "Cloudinary result:",
            result
        );


    } catch (error) {

        console.log(
            "Cloudinary delete error:",
            error.message
        );

    }

};


module.exports = {
    deleteImage
};