const express = require("express");

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
    deleteAccount
} = require("../controllers/user.controller");


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



module.exports = router;