const Plant = require("../models/plant.model");



// Create Plant

const createPlant = async (req, res) => {


    try {


        const {
            name,
            species,
            image_url
        } = req.body;



        const plant =
            await Plant.create({

                user_id: req.user.id,

                name,

                species,

                image_url

            });



        res.status(201).json({

            success: true,

            plant

        });



    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server error"

        });

    }


};




// Get User Plants

const getPlants = async (req, res) => {


    try {


        const plants =
            await Plant.findByUser(
                req.user.id
            );



        res.json({

            success: true,

            plants

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server error"

        });

    }


};




// Get One Plant

const getPlant = async (req, res) => {


    try {


        const plant =
            await Plant.findById(

                req.params.id,

                req.user.id

            );



        if (!plant) {

            return res.status(404).json({

                success: false,
                message: "Plant not found"

            });

        }



        res.json({

            success: true,

            plant

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server error"

        });

    }


};




// Delete Plant

const deletePlant = async (req, res) => {

    try {

        const AIAnalysis =
            require("../models/ai.model");


        const {
            deleteImage
        } = require("../services/cloudinary.service");



        const plant =
            await Plant.findById(
                req.params.id,
                req.user.id
            );


        if (!plant) {

            return res.status(404).json({

                success: false,

                message: "Plant not found"

            });

        }



        // حذف صورة النبتة الأساسية
        if (plant.image_url) {

            await deleteImage(
                plant.image_url
            );

        }



        // حذف صور تحليلات AI
        const images =
            await AIAnalysis.deleteByPlant(
                plant.id
            );


        for (const image of images) {

            await deleteImage(
                image.image_url
            );

        }



        // حذف النبتة
        await Plant.delete(
            plant.id,
            req.user.id
        );



        res.json({

            success: true,

            message: "Plant deleted successfully"

        });


    } catch (error) {

        console.log(error);


        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getPlantDetails = async (req, res) => {

    try {

        const { id } = req.params;


        const plant =
            await Plant.getDetails(id);


        if (!plant) {

            return res.status(404).json({

                success: false,
                message: "Plant not found"

            });

        }


        res.json({

            success: true,
            plant

        });


    } catch (error) {

        console.log(error);


        res.status(500).json({

            success: false,
            message: "Server error"

        });

    }

};
const updatePlant = async (req, res) => {

    try {

        const {
            name,
            species,
            image_url
        } = req.body;


        const plant =
            await Plant.update(
                req.params.id,
                req.user.id,
                {
                    name,
                    species,
                    image_url
                }
            );


        if (!plant) {

            return res.status(404).json({

                success: false,
                message: "Plant not found"

            });

        }


        res.json({

            success: true,

            plant

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

    createPlant,
    getPlants,
    getPlant,
    deletePlant,
    getPlantDetails,
    updatePlant

};