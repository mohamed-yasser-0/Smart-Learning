require("dotenv").config();
const express = require("express");
const router = require("./routes/route");
const userRouter = require("./routes/user.route");
const aiRouter = require("./routes/ai.route");
const lessonRouter = require("./routes/lesson.route");
const quizRouter = require("./routes/quiz.route");
const processRouter = require("./routes/progress.route.js");

const mongoose = require("mongoose");


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
app.use('/api/lessons', lessonRouter)
app.use('/api/quiz', quizRouter)
app.use('/api/progress', processRouter)
app.use('/api/user', userRouter)
app.use('/api/ai',aiRouter)

app.all('/*splat', (req, res, next) => {
    res.status(404).json({ status: ERROR, message: "this resource is not available" })
})
app.use((error, req, res, next) => {
    res.status(500).json({ status: ERROR, message: error.message })
})

app.listen(process.env.PORT, () => {
    console.log("Alhamd lla")
})