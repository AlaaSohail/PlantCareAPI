const rateLimit = require("express-rate-limit");


// =====================================================
// LOGIN
// 5 attempts / 15 minutes per IP
// =====================================================

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many login attempts. Please try again later."
    }
});


// =====================================================
// REGISTER
// 5 attempts / 1 hour per IP
// =====================================================

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many registration attempts. Please try again later."
    }
});


// =====================================================
// FORGOT PASSWORD
// 3 attempts / 15 minutes per IP
// =====================================================

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many password reset requests. Please try again later."
    }
});


// =====================================================
// RESEND VERIFICATION
// 3 attempts / 15 minutes per IP
// =====================================================

const resendVerificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many verification email requests. Please try again later."
    }
});


// =====================================================
// VERIFY RESET CODE
// 5 attempts / 15 minutes per IP
// =====================================================

const verifyResetCodeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many attempts. Please try again later."
    }
});


// =====================================================
// RESET PASSWORD
// 5 attempts / 15 minutes per IP
// =====================================================

const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many password reset attempts. Please try again later."
    }
});


// =====================================================
// GOOGLE LOGIN
// 10 attempts / 15 minutes per IP
// =====================================================

const googleLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many Google login attempts. Please try again later."
    }
});


// =====================================================
// AI PLANT ANALYSIS
// 10 requests / 15 minutes per USER
// =====================================================

const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    keyGenerator: (req) => {

        if (!req.user || !req.user.id) {
            throw new Error(
                "AI rate limiter requires authenticated user"
            );
        }

        return `user:${req.user.id}`;
    },

    message: {
        success: false,
        message: "Too many AI analysis requests. Please try again later."
    }
});


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    loginLimiter,
    registerLimiter,
    forgotPasswordLimiter,
    resendVerificationLimiter,
    verifyResetCodeLimiter,
    resetPasswordLimiter,
    googleLoginLimiter,
    aiLimiter
};
