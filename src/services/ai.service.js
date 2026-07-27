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

        model: "gemini-2.0-flash",

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
 "confidence":"",
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


    return response.text;

};


module.exports = analyzePlantImage;