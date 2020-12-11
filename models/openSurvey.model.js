import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    img: {
        type: String,
        default: null
    },
    open: {
        type: Boolean,
        default: false
    },
    answers: [String]
})

const surveySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    img: String,
    description: String,
    created: {
        type: Date,
        required: true,
        default: Date.now
    },
    questions: {
        type: [questionSchema],
        required: true
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
    type: {
        required: true,
        type: Number
    }
}, {
    collection: 'ankety'
})

export default mongoose.model('OpenSurvey', surveySchema)