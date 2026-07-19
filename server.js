const express = require("express");
const router = require("./routes/route");
const mongoose = require("mongoose");

const dns = require('dns');
dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8"]);

mongoose.connect('mongodb+srv://user:1234@smartlearning.rzxhzys.mongodb.net/?appName=SmartLearning')
    .then(() => console.log("Connected To MongoDB ✅"))
    .catch((err) => console.log(err));

const app = express();

app.use(express.json());
// نسيت / 
app.use('/api/courses', router)

app.listen(300, () => {
    console.log("Alhamd lla")
})