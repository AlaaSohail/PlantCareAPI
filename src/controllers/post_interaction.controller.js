const PostComment = require("../models/post_comment.model");


// =====================================================
// ADD COMMENT
// =====================================================

const addComment = async (req, res) => {

    try {

        const { postId } = req.params;
        const { content } = req.body;

        if (!content || content.trim().isEmpty) {

            return res.status(400).json({
                success: false,
                message: "Comment content is required"
            });

        }

        const comment = await PostComment.create(
            postId,
            req.user.id,
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


// =====================================================
// GET COMMENTS
// =====================================================

const getComments = async (req, res) => {

    try {

        const { postId } = req.params;

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

};


// =====================================================
// DELETE COMMENT
// =====================================================

const deleteComment = async (req, res) => {

    try {

        const { commentId } = req.params;

        const comment =
            await PostComment.delete(
                commentId,
                req.user.id
            );

        if (!comment) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not allowed to delete this comment"

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

};


module.exports = {

    addComment,
    getComments,
    deleteComment

};