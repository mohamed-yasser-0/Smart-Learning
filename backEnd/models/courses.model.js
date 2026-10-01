const mongoose = require("mongoose");

const coursesSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft",
    },
    // price: {
    //     type: Number,
    //     required: true
    // },
    thumbnail: {
        type: String
    },
    // category: {
    //     type: String
    // }
},
    {
        timestamps: true
    }
)
const Courses = mongoose.model('Course', coursesSchema)
module.exports = Courses