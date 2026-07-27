const Care = require("../models/care.model");
const Plant = require("../models/plant.model");



// Add care activity

const addCare = async (req, res) => {


    try {


        const plant =
            await Plant.findById(

                req.params.id,

                req.user.id

            );



        if (!plant) {

            return res.status(404).json({

                success: false,

                message: "Plant not found"

            });

        }



        const {
            action,
            notes
        } = req.body;



        const log =
            await Care.create({

                plant_id: plant.id,

                action,

                notes

            });



        res.status(201).json({

            success: true,

            message: "Care activity added",

            log

        });


    }
    catch (error) {

        console.log(error);


        res.status(500).json({

            success: false,

            message: "Server error"

        });


    }


};





// Get care history

const getCareLogs = async (req, res) => {


    try {


        const plant =
            await Plant.findById(

                req.params.id,

                req.user.id

            );



        if (!plant) {

            return res.status(404).json({

                success: false,

                message: "Plant not found"

            });

        }



        const logs =
            await Care.findByPlant(
                plant.id
            );



        res.json({

            success: true,

            logs

        });


    }
    catch (error) {

        console.log(error);


        res.status(500).json({

            success: false,

            message: "Server error"

        });


    }


};



module.exports = {

    addCare,

    getCareLogs

};