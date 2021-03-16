import Result from '../models/result.model.js'
import Anketa from '../models/anketa.model.js'
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
            const results = await Result.find({ anketa_id: req.params.id })
            const survey = await (await Anketa.findOne({ _id: req.params.id })).toJSON()

            const question = (id) => {
                id = String(id)
                for (let q of survey.questions) {
                    if (q._id == id) return q
                }
            }

            let excelFile = new excel.Workbook()
            let ws = excelFile.addWorksheet('Results')

            ws.cell(1, 1).string('id')
            ws.cell(1, 2).string('otazka')
            ws.cell(1, 3).string('popis otazky')
            ws.cell(1, 4).string('odpoved')
            ws.cell(1, 5).string('cas')

            let row = 2
            for (let i = 0; i < results.length; i++) {
                for (let j = 0; j < results[i].answers.length; j++) {
                    ws.cell(row, 1).string(String(results[i]._id))
                    ws.cell(row, 2).string(question(results[i].answers[j].question_id).question.cs)
                    ws.cell(row, 3).string(question(results[i].answers[j].question_id).description)
                    ws.cell(row, 4).string(results[i].answers[j].answer[0])
                    ws.cell(row, 5).number(results[i].answers[j].time)
                    row++
                }
            }

            if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')
            const filename = `Results_${survey.name.cs}`
            excelFile.write(`./tmp/${filename}.xlsx`, () => {
                res.sendFile(`${appRoot}/tmp/${filename}.xlsx`)
                // fs.rm(`${appRoot}/tmp/${filename}.xlsx`)
            })



        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }
}

const resultsController = new ResultController()
export default resultsController