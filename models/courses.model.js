const mongoose = require("mongoose");

const coursesSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    instructor: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    category: {
        type: String
    }
},
    {
        timestamps: true
    }
)
const Courses = mongoose.model('Course', coursesSchema)
module.exports = Courses