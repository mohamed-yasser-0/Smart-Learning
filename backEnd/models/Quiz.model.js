const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },

        title: {
            type: String,
            required: true,
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
    },
    { timestamps: true }
);

const quiz = mongoose.model("Quiz", quizSchema);
module.exports = quiz