const OpenAI = require("openai");
const axios = require("axios");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


// =====================================================
// PLANT IMAGE ANALYSIS
// =====================================================

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

    let result;

    try {

        result = JSON.parse(
            response.output_text
        );

    } catch (error) {

        throw new Error(
            "AI returned invalid response"
        );

    }

    return result;
};


// =====================================================
// AI CHAT
// =====================================================

const chatWithAI = async (message, imageUrl = null) => {

    const content = [];

    // النص
    if (message && message.trim()) {

        content.push({

            type: "input_text",

            text: message.trim()

        });

    }


    // الصورة اختيارية
    if (imageUrl) {

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


        content.push({

            type: "input_image",

            image_url:
                `data:${imageBuffer.headers["content-type"]};base64,${imageBase64}`

        });

    }


    // لا يوجد نص ولا صورة
    if (content.length === 0) {

        throw new Error(
            "Message or image is required"
        );

    }


    const response =
        await client.responses.create({

            model: "gpt-4.1-mini",

            input: [

                {
                    role: "system",

                    content: [

                        {
                            type: "input_text",

                            text: `
You are Planto AI, an expert botanist and plant care assistant.

Your job is to help users with:

- Plant identification
- Plant diseases
- Watering
- Fertilizing
- Sunlight
- Soil
- Pests
- Plant care
- Gardening

Answer clearly and practically.

If the user sends an image, analyze the image carefully.

If the user asks about something unrelated to plants,
politely explain that you specialize in plants and gardening.

Do not pretend to know something that cannot be determined
from the provided information.

Keep answers concise but useful.
`
                        }

                    ]

                },

                {
                    role: "user",

                    content

                }

            ]

        });


    return response.output_text;

};


module.exports = {

    analyzePlantImage,
    chatWithAI

};