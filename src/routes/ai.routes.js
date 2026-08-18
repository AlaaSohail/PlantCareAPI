const express = require("express");

const router = express.Router();


// =====================================================
// MIDDLEWARE
// =====================================================

const upload =
    require("../middleware/upload.middleware");

const authMiddleware =
    require("../middleware/auth.middleware");

const {
    aiLimiter
} = require("../middleware/rateLimit.middleware");


// =====================================================
// CONTROLLERS
// =====================================================

const {
    analyzePlant,
    getAnalysis,
    chat
} = require("../controllers/ai.controller");


// =====================================================
// ANALYZE PLANT
// =====================================================

router.post(
    "/plants/:id/analyze",
    authMiddleware,
    aiLimiter,
    upload.single("image"),
    analyzePlant
);


// =====================================================
// GET ANALYSIS
// =====================================================

router.get(
    "/plants/:id/analysis",
    authMiddleware,
    getAnalysis
);
// =====================================================
// AI CHAT
// =====================================================

router.post(
    "/ai/chat",
    authMiddleware,
    aiLimiter,
    upload.single("image"),
    chat
);

module.exports = router;
