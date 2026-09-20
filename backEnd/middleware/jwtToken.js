var jwt = require('jsonwebtoken');

function JwtToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET,{ expiresIn: "5h" });
}
module.exports = JwtToken