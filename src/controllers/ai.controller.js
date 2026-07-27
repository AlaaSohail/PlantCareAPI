const AIAnalysis =
    require("../models/ai.model");

const analyzePlantImage =
    require("../services/ai.service");



const analyzePlant = async (req, res) => {

    try {


        const image = req.file;


        if (!image) {

            return res.status(400).json({

                success: false,
                message: "Image required"

            });

        }


        // إنشاء رابط الصورة أولاً
        const imageUrl =
            `${req.protocol}://${req.get("host")}/${image.path.replace("\\", "/")}`;



        // إرسال الصورة إلى AI
        const aiResult =
            await analyzePlantImage(image.path);



        const data =
            JSON.parse(aiResult);



        // حفظ النتيجة
        const result =
            await AIAnalysis.create({

                user_id: req.user.id,

                plant_id: req.body.plant_id || null,

                image_url: imageUrl,

                disease: data.disease,

                confidence: data.confidence,

                recommendation: data.recommendation

            });



        res.json({

            success: true,

            analysis: result

        });


    }
    catch (error) {

        console.log(error);


        res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};

const getAnalysis = async (req, res) => {

    try {


        const results =
            await AIAnalysis.findByUser(
                req.user.id
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

            message: "Server error"

        });

    }

};

module.exports = {

    analyzePlant,
    getAnalysis

};