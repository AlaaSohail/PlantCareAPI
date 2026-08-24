const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/auth.middleware");

const {
    toggleLike,
    addComment,
    getComments,
    deleteComment
} = require("../controllers/post_interaction.controller");


// ========================
// LIKE
// ========================

router.post(
    "/posts/:postId/like",
    authMiddleware,
    toggleLike
);


// ========================
// COMMENTS
// ========================

router.post(
    "/posts/:postId/comments",
    authMiddleware,
    addComment
);


router.get(
    "/posts/:postId/comments",
    authMiddleware,
    getComments
);


router.delete(
    "/posts/:postId/comments/:commentId",
    authMiddleware,
    deleteComment
);


module.exports = router;