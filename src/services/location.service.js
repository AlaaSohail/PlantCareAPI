const axios = require("axios");


const getLocationDetails = async (
    latitude,
    longitude
) => {

    try {

        const response =
            await axios.get(
                "https://nominatim.openstreetmap.org/reverse",
                {
                    params: {
                        lat: latitude,
                        lon: longitude,
                        format: "json"
                    },

                    headers:{
                        "User-Agent":
                        "PlantCare-App"
                    }
                }
            );


        const address =
            response.data.address;


        return {

            country:
                address.country || null,


            city:
                address.city ||
                address.town ||
                address.village ||
                null

        };


    } catch(error){

        console.log(
            "LOCATION ERROR:",
            error.message
        );


        return {

            country:null,

            city:null

        };

    }

};


module.exports =
    getLocationDetails;