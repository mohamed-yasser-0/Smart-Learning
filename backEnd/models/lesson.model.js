const mongoose = require("mongoose");

const lessonSchema = mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },

    title: {
        type: String,
        required: true
    },
    questions: [
        {
            question: {
                type: String,
                required: true,
            },

            options: [
                {
                    type: String,
                    required: true,
                },
            ],

            correctAnswer: {
                type: String,
                required: true,
            },
        },
    ],
    description: {
        type: String
    },

    order: {
        type: Number,
    },

    type: {
        type: String,
        enum: ["video", "text", "quiz", "assignment"],
        required: true
    },

    isFree: {
        type: Boolean,
        default: false
    },

    video: {
        url: String,
        provider: {
            type: String,
            enum: ["youtube", "vimeo", "s3", "cloudinary"]
        },
        duration: Number,
        text: String
    },
    textContent: {
        type: String
    }
},
    {
        timestamps: true
    }
)

const Lesson = mongoose.model('Lesson', lessonSchema)
module.exports = Lesson