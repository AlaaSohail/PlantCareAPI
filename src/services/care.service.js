const generateCareTips = (analysis)=>{


    return [

        {

            type:"watering",

            title:"Watering",

            description:
            analysis.watering_advice

        },


        {

            type:"sunlight",

            title:"Sunlight",

            description:
            analysis.sunlight_advice

        },


        {

            type:"fertilizer",

            title:"Fertilizer",

            description:
            analysis.fertilizer_advice

        }

    ];


};



module.exports = {
    generateCareTips
};