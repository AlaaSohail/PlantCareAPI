const express = require("express");
const multer = require("multer");

const router = express.Router();

const authMiddleware =
    require("../middleware/auth.middleware");

const adminMiddleware =
    require("../middleware/admin.middleware");


const {
    updateProfile,
    profile,
    getUsers,
    changePassword,
    deleteAccount,
    updateLocation
} = require("../controllers/user.controller");


// Multer
const upload = multer({
    storage: multer.memoryStorage()
});


router.delete(
    "/account",
    authMiddleware,
    deleteAccount
);


router.get(
    "/profile",
    authMiddleware,
    profile
);


router.put(
    "/profile",
    authMiddleware,
    upload.single("image"),
    updateProfile
);


router.put(
    "/password",
    authMiddleware,
    changePassword
);


router.get(
    "/all",
    authMiddleware,
    adminMiddleware,
    getUsers
);


router.put(
    "/location",
    authMiddleware,
    updateLocation
);


module.exports = router;