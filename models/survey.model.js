import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
    question: {
        type: Map,
        of: String
    },
    description: String,
    img: {
        type: String,
        default: null
    },
    open: {
        type: Boolean,
        default: false
    },
    answers: {
        type: [String],
        required: false
    },
    other_answer: {
        type: Boolean,
        required: true,
        default: false
    },
    type: String,
    limit: Number,
    scale_end: Number,
    scale_start: Number,
    required: Boolean

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

const surveySchama = new mongoose.Schema({
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
    created: {
        type: Date,
        required: true,
        default: Date.now
    },
    updated: {
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
        required: false
    },
    languages: {
        type: [String],
        required: false
    },
    random_order: {
        type: Boolean,
        default: false
    },
    user_data: {
        type: Boolean,
        default: false
    },
    fill_reset: {
        type: Boolean,
        default: false
    },
    fullscreen: {
        type: Boolean,
        default: false
    },
    user_data_fields: [String],
    theme: {
        type: String,
        default: null
    },
    user_id: mongoose.ObjectId,
    type: {
        required: true,
        type: Number
    },
    enabled: {
        type: Boolean,
        default: true
    },
    ivet: {
        type: Boolean,
        default: false
    },
}, {
    collection: 'ankety'
})

export default mongoose.model('Survey', surveySchama)