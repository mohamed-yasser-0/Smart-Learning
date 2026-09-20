const asyncWrapper = require("../middleware/asyncWrapper");
const JwtToken = require("../middleware/jwtToken");
const Users = require("../models/users.model");
const ErrorHandel = require("../utils/appError");
const { SUCCESS } = require("../utils/httpStatusText");
const bcrypt = require('bcrypt');

const getUsers = async (req, res) => {
    const users = await Users.find({}, { __v: false });
    res.send(users)
}
const logInUser = asyncWrapper(async (req, res, next) => {
    const { password, email } = req.body
    const findUser = await Users.findOne({ email })
    if (!findUser) {
        return next(ErrorHandel("Invalid email or password", 401))
    }
    const hash = findUser.password

    const isMatch = await bcrypt.compare(password, hash)
    if (!isMatch) {
        return next(ErrorHandel("Invalid email or password", 401));
    }

    const token = JwtToken({ id: findUser._id, email: findUser.email })
    res.send({ token })
});

const registerUser = asyncWrapper(async (req, res, next) => {
    const { password, email, username } = req.body;
    const findemail = await Users.findOne({ email })
    if (findemail) {
        return next(ErrorHandel("Email already exists", 409))
    }
    const findUser = await Users.findOne({ username })
    if (findUser) {
        return next(ErrorHandel("Username already exists", 409))
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Users({
        ...req.body,
        password: hashedPassword,
    });
    await user.save();
    res.status(201).json({
        status: SUCCESS,
        message: "User created successfully",
    });
});
module.exports = { getUsers, logInUser, registerUser }