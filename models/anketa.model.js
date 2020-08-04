import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
    cs: String,
    en: String,
    de: String,
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
    cs: {
        type: String,
        required: true
    },
    en: String,
    de: String,
    value: {
        type: Number,
        default: true
    }
}, {
    _id: false
})

const nameSchema = new mongoose.Schema({
    cs: String,
    en: String,
    de: String
}, {
    _id: false
})

const anketaSchama = new mongoose.Schema({
    name: {
        type: nameSchema,
        required: true
    },
    img: String,
    description: nameSchema,
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
        default: [
            {
                name: 'Urcite ano',
                value: 1
            },
            {
                name: 'Spise ano',
                value: 2
            },
            {
                name: 'Nevim',
                value: 3
            },
            {
                name: 'Spise ne',
                value: 4
            },
            {
                name: 'Urcite ne',
                value: 5
            },
        ]
    },
    random_order: {
        type: Boolean,
        default: false
    },
    user_data: {
        type: Boolean,
        default: false
    },
    user_id: mongoose.ObjectId,
}, {
    collection: 'ankety'
})

export default mongoose.model('Anketa', anketaSchama)