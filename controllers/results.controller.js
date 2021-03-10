import Result from '../models/result.model.js'
import mongoose from 'mongoose'
import excel from 'excel4node'
import fs from 'fs'
import appRoot from 'app-root-path'

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
        if (req.cookies['pin'])
            req.body.pin = req.cookies['pin']
        try {
            const newResult = await new Result(req.body).save()
            res.json(newResult)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

    async getAllResults(req, res) {
        try {
            const results = await Result.find()
            res.json(results)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

    async deleteSurveyResults(req, res) {
        try {
            const results = await Result.deleteMany({ anketa_id: req.params.id })
            res.json(results)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

    async getExcelResults(req, res) {
        try {
            const results = await Result.find({ anketa_id: req.params.id }).populate('answers.question_id')

            console.log(results[0].answers)

            let excelFile = new excel.Workbook()
            let ws = excelFile.addWorksheet('Results')

            ws.cell(1, 1).string('id')

            for (let i = 0; i < results.length; i++) {
                const row = i + 2

                ws.cell(row, 1).string(String(results[i]._id))
            }

            if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')
            const filename = `Results_${req.params.id}`
            excelFile.write(`./tmp/${filename}.xlsx`, () => {
                res.sendFile(`${appRoot}/tmp/${filename}.xlsx`)
            })

        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }
}

const resultsController = new ResultController()
export default resultsController