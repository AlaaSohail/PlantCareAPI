const AIAnalysis =
    require("../models/ai.model");

const analyzePlantImage =
    require("../services/ai.service");

const Plant = require("../models/plant.model");

const analyzePlant = async (req,res)=>{

    try {


        const plant =
            await Plant.findById(
                req.params.id,
                req.user.id
            );


        if(!plant){

            return res.status(404).json({

                success:false,

                message:"Plant not found"

            });

        }



        if(!req.file){

            return res.status(400).json({

                success:false,

                message:"Image required"

            });

        }



        const imageUrl =
            req.file.path;



        // إرسال الصورة إلى Gemini
        const aiResult =
            await analyzePlantImage(
                imageUrl
            );



        /*
        مثال النتيجة:
        {
          disease:"Leaf spot",
          confidence:90,
          recommendation:"..."
        }
        */



        const savedAnalysis =
            await AIAnalysis.create({

                plant_id: plant.id,

                image_url:imageUrl,

                disease:aiResult.disease,

                confidence:aiResult.confidence,

                recommendation:
                    aiResult.recommendation

            });



        res.json({

            success:true,

            analysis:savedAnalysis

        });



    }
    catch(error){

        console.log("AI ERROR:",error);


        res.status(500).json({

            success:false,

            message:error.message

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


        if(!plant){

            return res.status(404).json({

                success:false,

                message:"Plant not found"

            });

        }



        const results =
            await AIAnalysis.findByPlant(
                plant.id
            );


        res.json({

            success:true,

            results

        });


    }
    catch(error){

        console.log(error);


        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

module.exports = {

    analyzePlant,
    getAnalysis

};