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
You are an expert botanist and plant doctor.

Analyze this plant image carefully.

Return ONLY valid JSON.
Do not use markdown.
Do not add any text outside JSON.

Use this exact format:

{
  "plant_name": "",
  "health_status": "",
  "disease": "",
  "confidence": 0.0,
  "recommendation": "",
  "watering_advice": "",
  "sunlight_advice": "",
  "fertilizer_advice": ""
}

Rules:
- Identify the plant name if possible.
- Determine if the plant is healthy or unhealthy.
- Mention visible diseases or problems.
- If there is no disease, use "None detected".
- confidence must be a number between 0 and 1.
- Give simple practical advice.
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

        plant_name: result.plant_name,

        health_status: result.health_status,

        disease: result.disease,

        confidence: result.confidence,

        recommendation: result.recommendation,

        watering_advice: result.watering_advice,

        sunlight_advice: result.sunlight_advice,

        fertilizer_advice: result.fertilizer_advice

    };


};



module.exports = analyzePlantImage;