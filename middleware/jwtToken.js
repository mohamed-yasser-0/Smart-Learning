var jwt = require('jsonwebtoken');

function JwtToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET,{ expiresIn: "1m" });
}
module.exports = JwtToken