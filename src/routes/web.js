const express = require("express");
const userController = require("../controllers/userController");
const middlewareController = require("../middleware/jwtVerify");
const productsController = require("../controllers/productController");
const mailController = require("../controllers/mailController");
const shopCartController = require("../controllers/shopCartController");
const initRoutes = (app) => {
    app.get("/", (req, res) => {
        res.send("Hello World!");
    });
    //user routes
    app.post("/api/register",userController.handleRegister);
    app.post("/api/login", userController.handleLogin);
    app.post("/api/change-password", middlewareController.verifyToken, userController.handleChangePassword);
    app.post("/api/getOtp", mailController.getOtp);
    app.post("/api/forgot-password", userController.handleForgotPassword);

    //product routes
    app.get("/api/products", productsController.getProducts);
    app.get("/api/product/:id", productsController.getProductById);
    app.get("/api/search", productsController.searchProduct);

    //cart routes
    app.post("/api/add-to-cart", middlewareController.verifyToken, shopCartController.addToCart);
    app.get("/api/get-cart", middlewareController.verifyToken, shopCartController.getAllcartUser);
    app.post("/api/delete-cart", middlewareController.verifyToken, shopCartController.deleteCart);

};
module.exports = initRoutes;