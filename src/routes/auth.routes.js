const express = require("express");

const router = express.Router();
const authenticateToken = require("../middleware/auth.middleware");


const {
    register,
    login,
    forgotPassword,
    resetPassword,
    logout,
    
} = require("../controllers/auth.controller");


const {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} = require("../validators/auth.validator");


const validate = require("../middleware/validation.middleware");


// Register
router.post(
    "/register",
    registerValidator,
    validate,
    register
);


// Login
router.post(
    "/login",
    loginValidator,
    validate,
    login
);


// Forgot Password
router.post(
    "/forgot-password",
    forgotPasswordValidator,
    validate,
    forgotPassword
);


// Reset Password
router.post(
    "/reset-password",
    resetPasswordValidator,
    validate,
    resetPassword
);

router.post("/logout", authenticateToken, logout);

// Google Login
const { googleLogin } = require("../controllers/social.controller");


router.post(
    "/google",
    googleLogin
);


module.exports = router;