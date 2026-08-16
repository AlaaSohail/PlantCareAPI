const express = require("express");

const router = express.Router();


// =====================================================
// MIDDLEWARE
// =====================================================

const authenticateToken =
    require("../middleware/auth.middleware");

const validate =
    require("../middleware/validation.middleware");

const {
    loginLimiter,
    registerLimiter,
    forgotPasswordLimiter,
    resendVerificationLimiter,
    verifyResetCodeLimiter,
    resetPasswordLimiter,
    googleLoginLimiter
} = require("../middleware/rateLimit.middleware");


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
    registerLimiter,
    registerValidator,
    validate,
    register
);


// =====================================================
// LOGIN
// =====================================================

router.post(
    "/login",
    loginLimiter,
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
    resendVerificationLimiter,
    resendVerificationEmail
);


// =====================================================
// FORGOT PASSWORD
// =====================================================

router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    forgotPasswordValidator,
    validate,
    forgotPassword
);


// =====================================================
// VERIFY RESET CODE
// =====================================================

router.post(
    "/verify-reset-code",
    verifyResetCodeLimiter,
    verifyResetCode
);


// =====================================================
// RESET PASSWORD
// =====================================================

router.post(
    "/reset-password",
    resetPasswordLimiter,
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
    googleLoginLimiter,
    googleLogin
);


module.exports = router;
