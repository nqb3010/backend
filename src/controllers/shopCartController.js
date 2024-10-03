const shopCartService = require('../services/shopCartServices');

const addToCart = async (req, res) => {
    try {
        const result = await shopCartService.addToCart(req.body, req.user);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllcartUser = async (req, res) => {
    try {
        const result = await shopCartService.getAllcartUser(req.body, req.user);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteCart = async (req, res) => {
    try {
        const result = await shopCartService.deleteCart(req.body, req.user);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    addToCart,
    getAllcartUser,
    deleteCart
}