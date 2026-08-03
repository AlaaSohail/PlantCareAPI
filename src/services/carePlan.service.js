const generateCarePlan = (plant_id,tips)=>{


    const today = new Date();


    return tips.map(tip=>{


        let repeat = "weekly";


        let days = 7;



        if(tip.type === "watering"){

            repeat = "daily";

            days = 3;

        }



        if(tip.type === "fertilizer"){

            repeat = "monthly";

            days = 30;

        }



        const date = new Date(today);

        date.setDate(
            today.getDate()+days
        );



        return {

            plant_id,

            type:tip.type,

            title:tip.title,

            description:
                tip.description,

            reminder_date:
                date,


            repeat_type:
                repeat

        };


    });


};


module.exports={
    generateCarePlan
};