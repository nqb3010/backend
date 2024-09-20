const productService = require('../services/productServices');

const getProducts = async (req, res) => {
    try {
        const result = await productService.getProducts(req.query);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getProducts
};