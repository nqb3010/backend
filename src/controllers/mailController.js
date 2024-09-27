const transporter = require('../config/mailConfig');
const mailServices = require('../services/mailServices');
const getOtp = async (req, res) => {
        try {
            const result = await mailServices.getOtp(req.body);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

module.exports = {
    getOtp
};
