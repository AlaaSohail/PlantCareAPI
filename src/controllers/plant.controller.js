const Plant = require("../models/plant.model");



// Create Plant

const createPlant = async (req, res) => {
    try {

           const {
            name,
            species,
            description,
            analysis
        } = req.body;

        // ==========================================
        // Check Image
        // ==========================================

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Plant image is required"
            });
        }

        // ==========================================
        // Cloudinary Image
        // ==========================================

        const image_url = req.file.path;
        const image_public_id = req.file.filename;

        // ==========================================
        // Create Plant
        // ==========================================

        const plant = await Plant.create({
            user_id: req.user.id,
            name,
            species,
            description,
            image_url,
            image_public_id
        });

        // ==========================================
        // Save Analysis
        // ==========================================

        if (analysis) {

            const aiResult =
                typeof analysis === "string"
                    ? JSON.parse(analysis)
                    : analysis;

            const AIAnalysis =
                require("../models/ai.model");

            const PlantHealth =
                require("../models/plantHealth.model");

            const {
                calculateHealthScore
            } =
                require("../services/health.service");

            const CareTip =
                require("../models/careTip.model");

            const {
                generateCareTips
            } =
                require("../services/care.service");

            const savedAnalysis =
                await AIAnalysis.create({

                    plant_id:
                        plant.id,

                    image_url:
                        aiResult.image_url,

                    disease:
                        aiResult.disease,

                    confidence:
                        Number(
                            aiResult.confidence
                        ),

                    recommendation:
                        aiResult.recommendation,

                    plant_name:
                        aiResult.plant_name,

                    health_status:
                        aiResult.health_status,

                    watering_advice:
                        aiResult.watering_advice,

                    sunlight_advice:
                        aiResult.sunlight_advice,

                    fertilizer_advice:
                        aiResult.fertilizer_advice,
                    description:
                        aiResult.description,
                    species:
                        aiResult.species
                });

            const healthScore =
                aiResult.health_score ??
                calculateHealthScore(
                    aiResult
                );

            await PlantHealth.create({

                plant_id:
                    plant.id,

                health_score:
                    Number(healthScore),

                health_status:
                    aiResult.health_status,

                last_analysis_id:
                    savedAnalysis.id
            });

            const tips =
                generateCareTips(
                    aiResult
                );

            for (const tip of tips) {

                await CareTip.create({

                    plant_id:
                        plant.id,

                    type:
                        tip.type,

                    title:
                        tip.title,

                    description:
                        tip.description
                });
            }
        }

        return res.status(201).json({

            success: true,

            plant

        });

    } catch (error) {

        console.log(
            "CREATE PLANT ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: error.message

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
            description
        } = req.body;


        const {
            deleteImage
        } = require("../services/cloudinary.service");


        // جلب النبتة القديمة
        const oldPlant =
            await Plant.findById(
                req.params.id,
                req.user.id
            );


        if (!oldPlant) {

            return res.status(404).json({

                success: false,

                message: "Plant not found"

            });

        }



        let image_url =
            oldPlant.image_url;


        let image_public_id =
            oldPlant.image_public_id;



        // إذا رفع صورة جديدة
        if (req.file) {


            // حذف القديمة
            if (oldPlant.image_public_id) {

                await deleteImage(
                    oldPlant.image_public_id
                );

            }


            // حفظ الجديدة
            image_url =
                req.file.path;


            image_public_id =
                req.file.filename;

        }



        const plant =
            await Plant.update(

                req.params.id,

                req.user.id,

                {
                    name,
                    species,
                    description,
                    image_url,
                    image_public_id
                }

            );



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