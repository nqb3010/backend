const JWT = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.JWT_SECRET;

const encodeToken = (data) => {
  return JWT.sign(
    {
      iss: "nqbdev",
        sub: data,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 3)
    },
    secret,
  );
};

module.exports = { encodeToken:encodeToken };
