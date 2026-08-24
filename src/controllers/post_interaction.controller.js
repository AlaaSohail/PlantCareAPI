const db = require("../config/database");

const PostComment =
    require("../models/post_comment.model");


// =====================================================
// LIKE / UNLIKE
// =====================================================

const toggleLike = async (req, res) => {

    try {

        const { postId } = req.params;
        const userId = req.user.id;


        // Check if user already liked the post

        const existingLike = await db.query(
            `
            SELECT id
            FROM post_likes
            WHERE post_id = $1
            AND user_id = $2
            `,
            [
                postId,
                userId
            ]
        );


        // ================================
        // UNLIKE
        // ================================

        if (existingLike.rows.length > 0) {

            await db.query(
                `
                DELETE FROM post_likes
                WHERE post_id = $1
                AND user_id = $2
                `,
                [
                    postId,
                    userId
                ]
            );

        }

        // ================================
        // LIKE
        // ================================

        else {

            await db.query(
                `
                INSERT INTO post_likes
                (
                    post_id,
                    user_id
                )
                VALUES
                (
                    $1,
                    $2
                )
                `,
                [
                    postId,
                    userId
                ]
            );

        }


        // Get current likes count

        const countResult = await db.query(
            `
            SELECT COUNT(*) AS count
            FROM post_likes
            WHERE post_id = $1
            `,
            [postId]
        );


        const likesCount =
            parseInt(countResult.rows[0].count);


        res.json({

            success: true,

            liked:
                existingLike.rows.length === 0,

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


// =====================================================
// ADD COMMENT
// =====================================================

const addComment = async (req, res) => {

    try {

        const { postId } = req.params;
        const { content } = req.body;


        if (
            !content ||
            content.trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                message: "Comment content is required"

            });

        }


        const comment =
            await PostComment.create(
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

            message:
                "Comment deleted successfully"

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
// EXPORTS
// =====================================================

module.exports = {

    toggleLike,

    addComment,
    getComments,
    deleteComment

};