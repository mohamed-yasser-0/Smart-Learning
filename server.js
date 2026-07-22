const express = require("express");
const router = require("./routes/route");
const userRouter = require("./routes/user.route.js");
const mongoose = require("mongoose");
require("dotenv").config();

const dns = require('dns');
const { SUCCESS, ERROR } = require("./utils/httpStatusText");
dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8"]);
mongoose.connect(process.env.URL)
    .then(() => console.log("Connected To MongoDB ✅"))
    .catch((err) => console.log(err));
const cors = require("cors");
const app = express();

app.use(cors());

app.use(express.json());
// نسيت / 
app.use('/api/courses', router)
app.use('/api/user', userRouter)

app.all('/*splat', (req, res, next) => {
    res.status(404).json({ status: ERROR, message: "this resource is not available" })
})
app.use((error, req, res, next) => {
    res.status(500).json({ status: ERROR, message: error.message })
})
app.listen(process.env.PORT, () => {
    console.log("Alhamd lla")
})