import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema({
    question_id: {
        type: mongoose.ObjectId,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    time: {
        type: Number,
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
    },
    lang: String
})

resultSchema.methods.getFullTime = () => {
    let time = 0
    for (answer in this.answers) {
        time += answer.time
    }
    return time
}

export default mongoose.model('Result', resultSchema)