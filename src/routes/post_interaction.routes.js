const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/auth.middleware");

const {
    addComment,
    getComments,
    deleteComment
} = require("../controllers/post_interaction.controller");


// =====================================================
// COMMENTS
// =====================================================

// Add Comment
router.post(
    "/posts/:postId/comments",
    authMiddleware,
    addComment
);


// Get Comments
router.get(
    "/posts/:postId/comments",
    authMiddleware,
    getComments
);


// Delete Comment
router.delete(
    "/posts/:postId/comments/:commentId",
    authMiddleware,
    deleteComment
);


module.exports = router;