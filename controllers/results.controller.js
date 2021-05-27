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
            let ws = excelFile.addWorksheet('Výsledky')

            const style = excelFile.createStyle({
                font: {
                    bold: true
                }
            })

            ws.cell(1, 1).string('id').style(style)
            ws.cell(1, 2).string('Otázka').style(style)
            ws.cell(1, 3).string('Popis otázky').style(style)
            ws.cell(1, 4).string('Typ otázky').style(style)
            ws.cell(1, 5).string('Odpověď').style(style)
            ws.cell(1, 6).string('Datum').style(style)
            ws.cell(1, 7).string('Čas odpovědi').style(style)

            let row = 2
            for (let i = 0; i < results.length; i++) {
                for (let j = 0; j < results[i].answers.length; j++) {
                    ws.cell(row, 1).string(String(results[i]._id))
                    ws.cell(row, 2).string(question(results[i].answers[j].question_id).question.cs)
                    ws.cell(row, 3).string(question(results[i].answers[j].question_id).description)
                    let type
                    if (question(results[i].answers[j].question_id).type == 'single') type = 'Výběr z možností'
                    if (question(results[i].answers[j].question_id).type == 'open') type = 'Otevřená otázka'
                    if (question(results[i].answers[j].question_id).type == 'scale') type = 'Škála'
                    ws.cell(row, 4).string(type)
                    ws.cell(row, 5).string(results[i].answers[j].answer[0])
                    ws.cell(row, 6).date(new Date(results[i].date)).style({ numberFormat: 'dd.mm.yyyy' })
                    ws.cell(row, 7).number(results[i].answers[j].time)
                    row++
                }
            }

            if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')
            const filename = `Results_${survey._id}`
            excelFile.write(`./tmp/${filename}.xlsx`, () => {
                res.download(`${appRoot}/tmp/${filename}.xlsx`, `${survey.name.cs}_výsledky.xlsx`)
                // fs.rm(`${appRoot}/tmp/${filename}.xlsx`)
            })



        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }
}

const resultsController = new ResultController()
export default resultsController