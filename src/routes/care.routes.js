const express = require("express");

const router = express.Router();


const authMiddleware =
    require("../middleware/auth.middleware");


const {

    addCare,
    getCareLogs

} = require("../controllers/care.controller");



router.post(

    "/plants/:id/care",

    authMiddleware,

    addCare

);



router.get(

    "/plants/:id/care",

    authMiddleware,

    getCareLogs

);



module.exports = router;