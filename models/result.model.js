import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
}, {
    _id: false
})

const resultSchema = new mongoose.Schema({
    answers: [answerSchema],
    anketa_id: {
        type: mongoose.ObjectId,
        required: true
    }
})

export default mongoose.model('Result', resultSchema)