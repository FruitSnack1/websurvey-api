import mongoose from 'mongoose'
const Schema = mongoose.Schema

const answerSchema = new mongoose.Schema({
    question_id: {
        type: mongoose.ObjectId,
        required: true
    },
    answer: [String],
    time: {
        type: Number,
        required: true
    }
}, {
    _id: false
})

const userDataSchema = new mongoose.Schema({
    key: String,
    value: String
}, {
    _id: false
})

const resultSchema = new mongoose.Schema({
    answers: [answerSchema],
    anketa_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Anketa'
    },
    lang: String,
    pin: {
        type: String,
        required: false
    },
    user_data: [userDataSchema],
    date: {
        required: true,
        default: Date.now,
        type: Date
    }
})

resultSchema.methods.getFullTime = () => {
    let time = 0
    for (answer in this.answers) {
        time += answer.time
    }
    return time
}

export default mongoose.model('Result', resultSchema)