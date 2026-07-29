const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/auth.middleware");


const {
    createPlant,
    getPlants,
    getPlant,
    deletePlant,
    getPlantDetails

} = require("../controllers/plant.controller");



router.post(
    "/",
    authMiddleware,
    createPlant
);


router.get(
    "/",
    authMiddleware,
    getPlants
);


router.get(
    "/:id",
    authMiddleware,
    getPlant
);


router.get(
    "/:id/details",
    authMiddleware,
    getPlantDetails
);


router.delete(
    "/:id",
    authMiddleware,
    deletePlant
);


module.exports = router;