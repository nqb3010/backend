const productService = require('../services/productServices');

const getProducts = async (req, res) => {
    try {
        const result = await productService.getProducts(req.query);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const getProductById = async (req, res) => {
    try {
        const result = await productService.getProductById(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const searchProduct = async (req, res) => {
    try {
        const result = await productService.searchProduct(req.query);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getProducts,
    getProductById,
    searchProduct
};