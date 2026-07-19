

data = [
    {
        name: "mohamed",
        age: 22
    }
]


const gitCourses = (req, res) => {
    res.send(data)
}

const postCourses = (req, res) => {
    data.push(req.body)
    res.send(data)
}
module.exports = {gitCourses,postCourses}