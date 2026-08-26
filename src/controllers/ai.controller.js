const AIAnalysis =
    require("../models/ai.model");

const {
    analyzePlantImage,
    chatWithAI
} = require("../services/ai.service");

const Plant = require("../models/plant.model");
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
}
    =
    require("../services/care.service");
const analyzePlant = async (req, res) => {

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



        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "Image required"

            });

        }



        const imageUrl =
            req.file.path;



        // إرسال الصورة إلى Gemini
        const aiResult =
            await analyzePlantImage(
                imageUrl
            );






        const savedAnalysis =
            await AIAnalysis.create({

                plant_id: plant.id,

                image_url: imageUrl,

                disease: aiResult.disease,

                confidence: Number(aiResult.confidence),

                recommendation:
                    aiResult.recommendation,
                plant_name: aiResult.plant_name,

                health_status: aiResult.health_status,

                watering_advice: aiResult.watering_advice,

                sunlight_advice: aiResult.sunlight_advice,

                fertilizer_advice: aiResult.fertilizer_advice,
                description: aiResult.description,
                species: aiResult.species

            });

        const healthScore =
            calculateHealthScore(aiResult);



        await PlantHealth.create({

            plant_id: plant.id,

            health_score: healthScore,

            health_status:
                aiResult.health_status,

            last_analysis_id:
                savedAnalysis.id

        });
        const tips =
            generateCareTips(aiResult);



        for (const tip of tips) {


            await CareTip.create({

                plant_id: plant.id,

                type: tip.type,

                title: tip.title,

                description: tip.description

            });


        }

        res.json({

            success: true,

            analysis: savedAnalysis

        });



    }
    catch (error) {

        console.log("AI ERROR:", error);


        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getAnalysis = async (req, res) => {

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



        const results =
            await AIAnalysis.findByPlant(
                plant.id
            );


        res.json({

            success: true,

            results

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
const chat = async (req, res) => {

    try {

        const {
            message
        } = req.body;


        let imageUrl = null;


        // الصورة اختيارية
        if (req.file) {

            imageUrl =
                req.file.path;

        }


        // لازم يكون فيه نص أو صورة
        if (
            (!message || !message.trim()) &&
            !imageUrl
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Message or image is required"

            });

        }


        const reply =
            await chatWithAI(
                message,
                imageUrl
            );


        res.json({

            success: true,

            message: reply

        });

    }

    catch (error) {

        console.log(
            "AI CHAT ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};

const analyzeNewPlant = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Plant image is required"
            });
        }

        // رابط الصورة بعد رفعها إلى Cloudinary
        const imageUrl = req.file.path;

        console.log("NEW PLANT IMAGE:", imageUrl);

        // إرسال رابط الصورة إلى Gemini
        const aiResult =
            await analyzePlantImage(imageUrl);

        console.log("AI RESULT:", aiResult);

        // حساب نسبة صحة النبات
        const healthScore =
            calculateHealthScore(aiResult);

        return res.status(200).json({
            success: true,

            analysis: {

                image_url:
                    imageUrl,

                image_public_id:
                    req.file.filename,

                disease:
                    aiResult.disease,

                confidence:
                    Number(aiResult.confidence),

                recommendation:
                    aiResult.recommendation,

                plant_name:
                    aiResult.plant_name,

                health_status:
                    aiResult.health_status,

                health_score:
                    healthScore,

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

            }
        });

    } catch (error) {

        console.error(
            "ANALYZE NEW PLANT ERROR:",
            error
        );

        console.error(
            "ERROR STACK:",
            error.stack
        );

        return res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack
        });
    }
};
module.exports = {
    analyzePlant,
    analyzeNewPlant,
    getAnalysis,
    chat
};