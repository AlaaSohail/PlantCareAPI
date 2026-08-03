const Notification =
    require("../models/notification.model");



const getNotifications = async (req, res) => {


    try {


        const notifications =
            await Notification.findByUser(
                req.user.id
            );



        res.json({

            success: true,

            notifications

        });


    }
    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }


};



module.exports = {
    getNotifications
};