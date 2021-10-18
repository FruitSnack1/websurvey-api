import Result from '../models/result.model.js'
import Anketa from '../models/anketa.model.js'
import mongoose from 'mongoose'
import fs from 'fs'
import appRoot from 'app-root-path'
import excelHelper from '../helpers/excel.helper.js'

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
            const survey = await Anketa.findOne({ _id: req.params.id })

            let excelFile = await excelHelper.generateExcel()
            excelFile = await excelHelper.addList(excelFile, survey, results)

            if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')
            const filename = `Results_${survey._id}`
            excelFile.write(`./tmp/${filename}.xlsx`, () => {
                res.download(`${appRoot}/tmp/${filename}.xlsx`, `${survey.toJSON().name.cs}_výsledky.xlsx`, () => {
                    fs.unlinkSync(`${appRoot}/tmp/${filename}.xlsx`)
                })
            })

        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

    async getAllExcelResults(req, res) {
        try {
            const surveys = await Anketa.find({})
            let excelFile = await excelHelper.generateExcel()
            for (let survey of surveys) {
                const results = await Result.find({ anketa_id: survey._id })
                excelFile = await excelHelper.addList(excelFile, survey, results)
            }

            if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')
            const filename = `Všechny_výsledky`
            excelFile.write(`./tmp/${filename}.xlsx`, () => {
                res.download(`${appRoot}/tmp/${filename}.xlsx`, `Všechny_výsledky.xlsx`, () => {
                    fs.unlinkSync(`${appRoot}/tmp/${filename}.xlsx`)
                })
            })

        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }
}

const resultsController = new ResultController()
export default resultsController