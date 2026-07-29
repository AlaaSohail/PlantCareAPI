const express = require("express");

const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

const adminMiddleware =
    require("../middleware/admin.middleware");


const {
    profile,
    getUsers
} = require("../controllers/user.controller");

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