const userServices = require('../services/userServices');

const handleRegister = async (req, res) => {
    try {
        const result = await userServices.register(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const handleLogin = async (req, res) => {
    try {
        const result = await userServices.login(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const handleChangePassword = async (req, res) => {
    try {
        const result = await userServices.changePassword(req.body, req.user);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const handleForgotPassword = async (req, res) => {
    try {
        const result = await userServices.forgotPassword(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    handleLogin, handleRegister, handleChangePassword, handleForgotPassword
};