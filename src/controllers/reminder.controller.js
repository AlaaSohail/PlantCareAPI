const Reminder = require("../models/reminder.model");
const Plant = require("../models/plant.model");


// Create Reminder
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



        const reminder =
            await Reminder.create({

                plant_id: plant.id,

                type: req.body.type,

                title: req.body.title,

                description: req.body.description,

                reminder_date: req.body.reminder_date

            });



        res.status(201).json({

            success: true,

            reminder

        });



    } catch (error) {


        console.log(error);


        res.status(500).json({

            success: false,

            message: error.message

        });


    }

};




// Get Plant Reminders
const getReminders = async (req, res) => {


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



        const reminders =
            await Reminder.findByPlant(
                plant.id
            );



        res.json({

            success: true,

            reminders

        });



    } catch (error) {


        console.log(error);


        res.status(500).json({

            success: false,

            message: error.message

        });


    }


};





// Complete Reminder
const completeReminder = async (req, res) => {


    try {


        const reminder =
            await Reminder.markCompleted(
                req.params.id
            );


        if (!reminder) {

            return res.status(404).json({

                success: false,

                message: "Reminder not found"

            });

        }



        res.json({

            success: true,

            reminder

        });



    } catch (error) {


        console.log(error);


        res.status(500).json({

            success: false,

            message: error.message

        });

    }


};



const updateReminder = async (req, res) => {

    try {


        const reminder =
            await Reminder.update(

                req.params.id,

                {

                    title: req.body.title,

                    description: req.body.description,

                    reminder_date: req.body.reminder_date,

                    type: req.body.type,

                    repeat_type: req.body.repeat_type

                }

            );


        if (!reminder) {

            return res.status(404).json({

                success: false,

                message: "Reminder not found"

            });

        }



        res.json({

            success: true,

            reminder

        });



    } catch (error) {


        console.log(error);


        res.status(500).json({

            success: false,

            message: error.message

        });


    }

};

// Delete Reminder
const deleteReminder = async (req, res) => {


    try {


        await Reminder.delete(
            req.params.id
        );


        res.json({

            success: true,

            message: "Reminder deleted"

        });



    } catch (error) {


        res.status(500).json({

            success: false,

            message: error.message

        });


    }


};





module.exports = {

    createReminder,

    getReminders,

    completeReminder,

    deleteReminder,

    updateReminder 

};