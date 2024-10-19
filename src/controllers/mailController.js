const transporter = require('../config/mailConfig');
const mailServices = require('../services/mailService');
const getOtp = async (req, res) => {
        try {
            const result = await mailServices.getOtp(req.body);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

const feedback = async (req, res) => {
    try {
        const result = await mailServices.feedback(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}    
module.exports = {
    getOtp,
    feedback
};
