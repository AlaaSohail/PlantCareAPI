const OpenAI = require("openai");
const fs = require("fs");


const client = new OpenAI({

    apiKey: process.env.OPENAI_API_KEY

});



const analyzePlantImage = async (imagePath) => {


    const imageBase64 =
        fs.readFileSync(imagePath)
        .toString("base64");



    const response =
        await client.responses.create({

            model: "gpt-4.1-mini",

            input: [

                {
                    role: "user",

                    content: [

                        {
                            type: "input_text",

                            text: `
Analyze this plant image.

Return ONLY valid JSON.

Format:

{
 "plant_name":"",
 "disease":"",
 "confidence":0,
 "recommendation":""
}

Do not add markdown.
Do not add explanations.
`
                        },


                        {
                            type: "input_image",

                            image_url:
                            `data:image/jpeg;base64,${imageBase64}`

                        }

                    ]

                }

            ]

        });



    const result =
        JSON.parse(
            response.output_text
        );



    return {

        disease: result.disease,

        confidence: result.confidence,

        recommendation:
            result.recommendation

    };


};



module.exports = analyzePlantImage;