const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/auth.middleware");


const upload =
    require("../middleware/upload.middleware");


const {

    createPlant,
    getPlants,
    getPlant,
    deletePlant,
    getPlantDetails,
    updatePlant

} = require("../controllers/plant.controller");



router.post(
    "/",
    authMiddleware,
    upload.single("image"),
    (req, res, next) => {
        console.log("FILE:", req.file);
        console.log("BODY:", req.body);
        next();
    },
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



router.put(
    "/:id",
    authMiddleware,
    upload.single("image"),
    updatePlant
);



module.exports = router;