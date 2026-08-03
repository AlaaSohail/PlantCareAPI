const calculateHealthScore = (analysis)=>{


    let score = 50;



    if(
        analysis.health_status === "Healthy"
    ){

        score += 30;

    }
    else {

        score -= 20;

    }



    score +=
        Number(analysis.confidence) * 20;



    if(score > 100)
        score = 100;



    if(score < 0)
        score = 0;



    return Math.round(score);

};



module.exports = {
    calculateHealthScore
};