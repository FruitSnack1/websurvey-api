import Result from '../models/result.model.js'
import mongoose from 'mongoose'

class ResultController {
    async getAnketaResults(req, res) {
        try {
            const results = await Result.find({
                anketa_id: req.params.id
            })
            res.json(results)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

    async postAnketaResult(req, res) {
        if (!req.body.anketa_id)
            res.json({ message: 'Missing anketa id' })
        req.body.anketa_id = new mongoose.Types.ObjectId(req.body.anketa_id)
        try {
            const newResult = await new Result(req.body).save()
            res.json(newResult)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }
}

const resultsController = new ResultController()
export default resultsController