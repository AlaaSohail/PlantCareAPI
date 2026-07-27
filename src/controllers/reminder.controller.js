const Reminder = require("../models/reminder.model");
const Plant = require("../models/plant.model");



const createReminder = async (req, res) => {


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
            type,
            reminder_date
        } = req.body || {};

        if (!type || !reminder_date) {

            return res.status(400).json({

                success: false,
                message: "Type and reminder date are required"

            });

        }

        const reminder =
            await Reminder.create({

                plant_id: plant.id,

                type,

                reminder_date

            });



        res.json({

            success: true,

            reminder

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




const getReminders = async (req, res) => {


    try {


        const reminders =
            await Reminder.findByUser(
                req.user.id
            );



        res.json({

            success: true,

            reminders

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

    createReminder,

    getReminders

};