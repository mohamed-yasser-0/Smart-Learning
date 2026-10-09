const asyncWrapper = require("../middleware/asyncWrapper");
const JwtToken = require("../middleware/jwtToken");
const Users = require("../models/users.model");
const ErrorHandel = require("../utils/appError");
const { SUCCESS } = require("../utils/httpStatusText");
const bcrypt = require('bcrypt');
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

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
    if (!findUser.password) {
        return next(ErrorHandel("Invalid email or password", 401));
    }

    const isMatch = await bcrypt.compare(password, findUser.password);

    if (!isMatch) {
        return next(ErrorHandel("Invalid email or password", 401));
    }

    const token = JwtToken({
        id: findUser._id,
        username: findUser.username,
        email: findUser.email,
        role: findUser.role,
        avatar: findUser.avatar,
    }); res.send({ token })
});
const googleLogin = asyncWrapper(async (req, res, next) => {
    const { credential } = req.body;

    if (!credential) {
        return next(ErrorHandel("Google credential is required", 400));
    }

    let ticket;

    try {
        ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
    } catch (error) {
        return next(ErrorHandel("Invalid Google credential", 401));
    }

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email || payload.email_verified !== true) {
        return next(ErrorHandel("Invalid Google account", 401));
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const username = email.split("@")[0];

    let user = await Users.findOne({ googleId });

    if (!user) {
        user = await Users.findOne({ email });

        if (user) {
            if (user.authProvider !== "google") {
                return next(
                    ErrorHandel(
                        "This email is already registered. Please log in using your existing method.",
                        409
                    )
                );
            }

            user.googleId = googleId;
            await user.save();
        } else {
            let uniqueUsername = username;
            let counter = 1;

            while (await Users.exists({ username: uniqueUsername })) {
                uniqueUsername = `${username}${counter}`;
                counter++;
            }

            user = await Users.create({
                username: uniqueUsername,
                email,
                googleId,
                authProvider: "google",
                avatar: payload.picture || "",
                role: "user",
            });
        }
    }

    const token = JwtToken({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
    });

    res.status(200).json({ token });
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
module.exports = { getUsers, logInUser, registerUser, googleLogin }