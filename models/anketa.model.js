const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    img: {
        type: String,
        default: null
    }
},{
    _id: false
})

const answerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        default: true
    }
},{
    _id: false
})

const anketaSchama = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    img: String,
    description: String,
    date: {
        type : Date,
        required: true,
        default: Date.now
    },
    questions :{
        type: [questionSchema],
        required: true
    },
    answers:{
        type:[answerSchema],
        default:[
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
    random_order:{
        type:Boolean,
        default:false
    },
    user_data:{
        type:Boolean,
        default:false
    },
    user_id: mongoose.ObjectId,
},{
    collection: 'ankety'
})

module.exports = mongoose.model('Anketa', anketaSchama)