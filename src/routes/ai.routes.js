const express = require("express");

const router = express.Router();


const upload =
    require("../middleware/upload.middleware");


const authMiddleware =
    require("../middleware/auth.middleware");


const {

    analyzePlant,

    getAnalysis

} = require("../controllers/ai.controller");



router.post(

    "/analyze",

    authMiddleware,

    upload.single("image"),

    analyzePlant

);



router.get(

    "/history",

    authMiddleware,

    getAnalysis

);



module.exports = router;