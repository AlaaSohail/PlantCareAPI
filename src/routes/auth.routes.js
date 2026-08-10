const express = require("express");
const router = express.Router();

const authenticateToken =
    require("../middleware/auth.middleware");


// =====================================================
// CONTROLLERS
// =====================================================

const {
    register,
    login,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    logout,
    verifyResetCode
} = require("../controllers/auth.controller");


// Google Login
const {
    googleLogin
} = require("../controllers/social.controller");


// =====================================================
// VALIDATORS
// =====================================================

const {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} = require("../validators/auth.validator");

const validate =
    require("../middleware/validation.middleware");


// =====================================================
// TEST
// =====================================================

router.get("/test", (req, res) => {

    res.json({
        success: true,
        message: "Auth route working"
    });

});


// =====================================================
// REGISTER
// =====================================================

router.post(
    "/register",
    registerValidator,
    validate,
    register
);


// =====================================================
// LOGIN
// =====================================================

router.post(
    "/login",
    loginValidator,
    validate,
    login
);


// =====================================================
// VERIFY EMAIL
// =====================================================

router.get(
    "/verify-email",
    verifyEmail
);


// =====================================================
// RESEND VERIFICATION EMAIL
// =====================================================

router.post(
    "/resend-verification",
    resendVerificationEmail
);

// =====================================================
// FORGOT PASSWORD
// =====================================================

router.post(
    "/forgot-password",
    forgotPasswordValidator,
    validate,
    forgotPassword
);

// =====================================================
// VERIFY RESET CODE
// =====================================================

router.post(
    "/verify-reset-code",
    verifyResetCode
);

// =====================================================
// RESET PASSWORD
// =====================================================

router.post(
    "/reset-password",
    resetPasswordValidator,
    validate,
    resetPassword
);

// =====================================================
// LOGOUT
// =====================================================

router.post(
    "/logout",
    authenticateToken,
    logout
);

// =====================================================
// GOOGLE LOGIN
// =====================================================

router.post(
    "/google",
    googleLogin
);

module.exports = router;