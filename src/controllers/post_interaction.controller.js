const db = require("../config/database");

const PostLike = require("../models/post_like.model");
const PostComment = require("../models/post_comment.model");

const toggleLike = async (req, res) => {

    try {

        const postId = req.params.postId;
        const userId = req.user.id;

        // التأكد أن المنشور موجود
        const post = await db.query(
            `
            SELECT id
            FROM posts
            WHERE id = $1
            `,
            [postId]
        );

        if (post.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Post not found"
            });

        }

        // هل المستخدم عامل Like؟
        const existingLike =
            await PostLike.findByUserAndPost(
                userId,
                postId
            );

        let liked;

        if (existingLike) {

            await PostLike.delete(
                userId,
                postId
            );

            liked = false;

        } else {

            await PostLike.create(
                userId,
                postId
            );

            liked = true;
        }

        const likesCount =
            await PostLike.countByPost(postId);

        res.json({
            success: true,
            liked,
            likesCount
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const addComment = async (req, res) => {

    try {

        const postId = req.params.postId;
        const userId = req.user.id;

        const { content } = req.body;

        if (!content || content.trim().isEmpty) {

            return res.status(400).json({
                success: false,
                message: "Comment content is required"
            });

        }

        const post = await db.query(
            `
            SELECT id
            FROM posts
            WHERE id = $1
            `,
            [postId]
        );

        if (post.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Post not found"
            });

        }

        const comment =
            await PostComment.create(
                postId,
                userId,
                content.trim()
            );

        res.status(201).json({
            success: true,
            comment
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
const getComments = async (req, res) => {

    try {

        const postId = req.params.postId;

        const comments =
            await PostComment.findByPost(postId);

        res.json({
            success: true,
            comments
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}; const deleteComment = async (req, res) => {

    try {

        const commentId = req.params.commentId;
        const userId = req.user.id;

        const comment =
            await PostComment.delete(
                commentId,
                userId
            );

        if (!comment) {

            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this comment"
            });

        }

        res.json({
            success: true,
            message: "Comment deleted successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}; module.exports = {
    toggleLike,
    addComment,
    getComments,
    deleteComment
};