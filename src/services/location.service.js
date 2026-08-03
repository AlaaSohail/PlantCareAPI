const axios = require("axios");


const getLocationDetails = async (
    latitude,
    longitude
) => {

    try {

        const response = await axios.get(
            "https://api.geoapify.com/v1/geocode/reverse",
            {
                params: {
                    lat: latitude,
                    lon: longitude,
                    apiKey:
                        process.env.GEOAPIFY_KEY
                }
            }
        );


        const properties =
            response.data.features[0]?.properties;


        console.log("GEOAPIFY PROPERTIES:", properties);


        return {

            country:
                properties?.country || null,


            city:
                properties?.city ||
                properties?.municipality ||
                properties?.town ||
                properties?.village ||
                properties?.district ||
                properties?.county ||
                properties?.state ||
                null

        };


    } catch (error) {

        console.log(
            "GEOAPIFY ERROR:",
            error.message
        );


        return {
            country: null,
            city: null
        };

    }

};


module.exports = getLocationDetails;