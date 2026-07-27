const User = require("../models/user.model");


const profile = async (req,res)=>{


    try {


        const user = await User.findById(
            req.user.id
        );


        if(!user){

            return res.status(404).json({

                success:false,
                message:"User not found"

            });

        }


        res.json({

            success:true,

            user

        });



    } catch(error){


        console.log(error);


        res.status(500).json({

            success:false,
            message:"Server error"

        });


    }


};


module.exports = {
    profile
};