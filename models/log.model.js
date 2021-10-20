import mongoose from 'mongoose'

const logSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now()
    },
    action: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    ip: String
})

export default mongoose.model('Log', logSchema)