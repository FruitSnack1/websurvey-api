const mongoose = require('mongoose')

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
    questions :[
        {
            question: String,
            img: String
        }
    ],
    aswers:[
        {
            name: String,
            value: Number
        }
    ],
    random_order:{
        type:Boolean,
        default:false
    },
    user_data:{
        type:Boolean,
        default:false
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Anketa', anketaSchama)