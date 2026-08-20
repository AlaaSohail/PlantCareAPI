const Post = require("../models/post.model");


// =====================================================
// CREATE POST
// =====================================================

const createPost = async (req, res) => {

    try {

        const {
            content
        } = req.body;


        if (!content || content.trim() === "") {

            return res.status(400).json({

                success: false,
                message: "Post content is required"

            });

        }


        let image_url = null;
        let image_public_id = null;


        if (req.file) {

            image_url = req.file.path;

            image_public_id = req.file.filename;

        }


        const post = await Post.create({

            user_id: req.user.id,

            content: content.trim(),

            image_url,

            image_public_id

        });


        res.status(201).json({

            success: true,

            post

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
// GET ALL POSTS
// =====================================================

const getPosts = async (req, res) => {

    try {

        const posts =
            await Post.findAll();


        res.json({

            success: true,

            posts

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
// GET ONE POST
// =====================================================

const getPost = async (req, res) => {

    try {

        const post =
            await Post.findById(
                req.params.id
            );


        if (!post) {

            return res.status(404).json({

                success: false,
                message: "Post not found"

            });

        }


        res.json({

            success: true,

            post

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
// UPDATE POST
// =====================================================

const updatePost = async (req, res) => {

    try {

        const {
            content
        } = req.body;


        const oldPost =
            await Post.findById(
                req.params.id
            );


        if (!oldPost) {

            return res.status(404).json({

                success: false,
                message: "Post not found"

            });

        }


        if (
            Number(oldPost.user_id) !==
            Number(req.user.id)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not allowed to update this post"

            });

        }


        let image_url =
            oldPost.image_url;

        let image_public_id =
            oldPost.image_public_id;


        if (req.file) {

            const {
                deleteImage
            } = require("../services/cloudinary.service");


            if (oldPost.image_public_id) {

                await deleteImage(
                    oldPost.image_public_id
                );

            }


            image_url =
                req.file.path;

            image_public_id =
                req.file.filename;

        }


        const post =
            await Post.update(

                req.params.id,

                req.user.id,

                {

                    content:
                        content?.trim() ??
                        oldPost.content,

                    image_url,

                    image_public_id

                }

            );


        res.json({

            success: true,

            post

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};



// =====================================================
// DELETE POST
// =====================================================

const deletePost = async (req, res) => {

    try {

        const {
            deleteImage
        } = require("../services/cloudinary.service");


        const post =
            await Post.findById(
                req.params.id
            );


        if (!post) {

            return res.status(404).json({

                success: false,

                message: "Post not found"

            });

        }


        if (
            Number(post.user_id) !==
            Number(req.user.id)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not allowed to delete this post"

            });

        }


        if (post.image_public_id) {

            await deleteImage(
                post.image_public_id
            );

        }


        await Post.delete(

            req.params.id,

            req.user.id

        );


        res.json({

            success: true,

            message:
                "Post deleted successfully"

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


module.exports = {

    createPost,
    getPosts,
    getPost,
    updatePost,
    deletePost

};