const JWT = require("jsonwebtoken");
const db = require("../models/index");
require("dotenv").config();
const secret = process.env.JWT_SECRET;

const middlewareController = {
    verifyToken: async (req, res, next) => {
        const authorizationHeader = req.headers.authorization;
        
        if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
            const token = authorizationHeader.split(" ")[1];
            
            try {
                const decoded = JWT.verify(token, secret);
                const user = await db.User.findOne({ where: { email: decoded.sub } });
                
                if (!user) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                
                req.user = user.email;
                next();
            } catch (err) {
                return res.status(401).json({ message: "Unauthorized" });
            }
        } else {
            return res.status(401).json({ message: "Unauthorized" });
        }
    }

};

module.exports = middlewareController;