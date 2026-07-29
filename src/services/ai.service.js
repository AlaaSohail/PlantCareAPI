const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");


const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


const analyzePlantImage = async (imagePath) => {

    const imageBase64 = fs
        .readFileSync(imagePath)
        .toString("base64");


    const response = await ai.models.generateContent({

        model: "gemini-2.0-flash-001",
        contents: [
            {
                role: "user",

                parts: [

                    {
                        text: `
Analyze this plant image.

Return JSON only:

{
 "plant_name":"",
 "disease":"",
 "confidence":0,
 "recommendation":""
}
`
                    },

                    {
                        inlineData: {

                            mimeType: "image/jpeg",

                            data: imageBase64

                        }
                    }

                ]
            }
        ]

    });


    console.log(response.text);
    let text = response.text;


    // إزالة أي markdown من Gemini
    text = text
        .replace("```json", "")
        .replace("```", "")
        .trim();



    const result = JSON.parse(text);



    return {

        plant_name: result.plant_name,

        disease: result.disease,

        confidence: Number(result.confidence),

        recommendation: result.recommendation

    };


};



module.exports = analyzePlantImage;