const { body } = require("express-validator");


const registerValidator = [

    body("name")
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters"),


    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email"),


    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters")

];


const loginValidator = [

    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email"),


    body("password")
        .notEmpty()
        .withMessage("Password is required")

];
const forgotPasswordValidator = [

    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email")

];
const resetPasswordValidator = [

    body("token")
        .notEmpty()
        .withMessage("Token is required"),

    body("password")
        .isLength({min:6})
        .withMessage("Password must be at least 6 characters")

];

module.exports = {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator
};