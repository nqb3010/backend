const orderService = require('../services/orderService');


const createOrder = async (req, res) => {
    try {
        const result = await orderService.createOrder(req.body, req.user);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getOrders = async (req, res) => {
    try {
        const result = await orderService.getOrders(req.user);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const paymentOrder = async (req, res) => {
    try {
        var ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
        const result = await orderService.paymentOrder(req.body, req.user, ipAddr);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const vnpayReturn = async (req, res) => {
    try {
        const result = await orderService.vnpayReturn(req.body, req.user);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports = {
    createOrder,
    getOrders,
    paymentOrder,
    vnpayReturn
}