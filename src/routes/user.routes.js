const express = require("express");

const router = express.Router();


const authMiddleware =
require("../middleware/auth.middleware");


const {
    profile
} = require("../controllers/user.controller");



router.get(
"/profile",
authMiddleware,
profile
);



module.exports = router;