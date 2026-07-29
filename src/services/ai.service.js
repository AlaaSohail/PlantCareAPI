const OpenAI = require("openai");
const axios = require("axios");


const client = new OpenAI({

    apiKey: process.env.OPENAI_API_KEY

});



const analyzePlantImage = async (imageUrl) => {


    const imageBuffer =
        await axios.get(
            imageUrl,
            {
                responseType: "arraybuffer"
            }
        );


    const imageBase64 =
        Buffer.from(imageBuffer.data)
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
                                `data:${imageBuffer.headers["content-type"]};base64,${imageBase64}`

                        }

                    ]

                }

            ]

        });



    const result =
        JSON.parse(
            response.output_text
        );



    return result;


};


module.exports = analyzePlantImage;