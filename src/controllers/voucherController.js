const voucherService = require('../services/voucherService');

const applyVoucher = async (req, res) => {
    try {
        const result = await voucherService.applyVoucher(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    applyVoucher
};