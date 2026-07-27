const express = require("express");

const router = express.Router();


const {
    register,
    login,
    forgotPassword,
    resetPassword
} = require("../controllers/auth.controller");


router.post(
    "/register",
    register
);

router.post(
    "/login",
    login
);
router.post(
    "/forgot-password",
    forgotPassword
);


router.post(
    "/reset-password",
    resetPassword
);

const {
    googleLogin
}
    =
    require("../controllers/social.controller");


router.post(
    "/google",
    googleLogin
);

module.exports = router;