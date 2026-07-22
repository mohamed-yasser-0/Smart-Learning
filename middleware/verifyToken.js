var jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = (req.headers.authorization || req.headers.Authorization).split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
    next()
}
module.exports = verifyToken