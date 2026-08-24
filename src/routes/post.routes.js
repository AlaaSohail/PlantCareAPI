const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/auth.middleware");

const upload =
    require("../middleware/upload.middleware");
    const {
    toggleLike
} = require("../controllers/post_interaction.controller");

const {
    createPost,
    getPosts,
    getPost,
    updatePost,
    deletePost
} = require("../controllers/post.controller");


// Create Post
router.post(
    "/",
    authMiddleware,
    upload.single("image"),
    createPost
);


// Get All Posts
router.get(
    "/",
    authMiddleware,
    getPosts
);


// Get One Post
router.get(
    "/:id",
    authMiddleware,
    getPost
);


// Update Post
router.put(
    "/:id",
    authMiddleware,
    upload.single("image"),
    updatePost
);


// Delete Post
router.delete(
    "/:id",
    authMiddleware,
    deletePost
);


router.post(
    "/:postId/like",
    authMiddleware,
    toggleLike
);
module.exports = router;