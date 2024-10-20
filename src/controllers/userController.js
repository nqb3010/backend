const userService = require('../services/userService');

const handleRegister = async (req, res) => {
    try {
        const result = await userService.register(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const handleLogin = async (req, res) => {
    try {
        const result = await userService.login(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const handleChangePassword = async (req, res) => {
    try {
        const result = await userService.changePassword(req.body, req.user);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const handleForgotPassword = async (req, res) => {
    try {
        const result = await userService.forgotPassword(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    handleLogin, handleRegister, handleChangePassword, handleForgotPassword
};