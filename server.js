const express = require("express");
const router = require("./routes/route");


const app = express();

app.use(express.json());
// نسيت / 
app.use('/api/courses', router)

app.listen(300, () => {
    console.log("Alhamd lla")
})