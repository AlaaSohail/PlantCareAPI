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
    updateLocation,
    updateFcmToken,
    getNotificationSettings,
    updateNotificationSettings
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
router.put(
  "/fcm-token",
  authMiddleware,
  updateFcmToken
);


router.get(
    "/notification-settings",
    authMiddleware,
    getNotificationSettings
);

router.put(
    "/notification-settings",
    authMiddleware,
    updateNotificationSettings
);
module.exports = router;