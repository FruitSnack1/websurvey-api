const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: Number,
        required: true
    }
},{
    _id: false
})

const resultSchema = new mongoose.Schema({
    answers: [answerSchema],
    anketa_id: {
        type: mongoose.ObjectId,
        required: true
    }
})

module.exports = mongoose.model('Result', resultSchema)