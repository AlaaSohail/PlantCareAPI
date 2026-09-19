const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { getWeatherAlerts } = require("../controllers/weather.controller");

router.get("/alerts", authMiddleware, getWeatherAlerts);

module.exports = router;
