const express = require("express");
const userController = require("../controllers/userController");
const JwtVerify = require("../middleware/JwtVerify");
const middlewareController = require("../middleware/JwtVerify");
const productsController = require("../controllers/productController");
const mailController = require("../controllers/mailController");
const initRoutes = (app) => {
    app.get("/", (req, res) => {
        res.send("Hello World!");
    });
    app.post("/api/register",userController.handleRegister);
    app.post("/api/login", userController.handleLogin);
    app.post("/api/change-password", middlewareController.verifyToken, userController.handleChangePassword);
    app.get("/api/products", productsController.getProducts);
    app.get("/api/product/:id", productsController.getProductById);
    app.get("/api/search", productsController.searchProduct);
    app.post("/api/getOtp", mailController.getOtp);
    app.post("/api/forgot-password", userController.handleForgotPassword);
};
module.exports = initRoutes;