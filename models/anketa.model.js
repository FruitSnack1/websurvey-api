import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
    question: {
        type: Map,
        of: String
    },
    img: {
        type: String,
        default: null
    },
    open: {
        type: Boolean,
        default: false
    }
})

const answerSchema = new mongoose.Schema({
    answer: {
        type: Map,
        of: String
    },
    value: {
        type: Number,
        default: true
    }
}, {
    _id: false
})

const anketaSchama = new mongoose.Schema({
    name: {
        type: Map,
        of: String,
        required: true
    },
    img: String,
    description: {
        type: Map,
        of: String,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    questions: {
        type: [questionSchema],
        required: true
    },
    answers: {
        type: [answerSchema],
    },
    languages: [{
        type: String
    }],
    random_order: {
        type: Boolean,
        default: false
    },
    user_data: {
        type: Boolean,
        default: false
    },
    theme: {
        type: String,
        default: null
    },
    user_id: mongoose.ObjectId,
}, {
    collection: 'ankety'
})

export default mongoose.model('Anketa', anketaSchama)