import fs from 'fs'
import appRoot from 'app-root-path'
import excelHelper from '../helpers/excel.helper.js'
import logService from '../services/log.service.js'
import resultService from '../services/result.service.js'
import surveyService from '../services/survey.service.js'

class ResultController {

    async getSurveyResults(req, res) {
        try {
            const results = await resultService.getSurveyResults(req.params.id)
            res.json(results)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

    async postSurveyResult(req, res) {
        try {
            const result = await resultService.postSurveyResult(req.body)
            const survey = await surveyService.getSurvey(req.body.anketa_id)
            logService.logAction('result', req, survey.toJSON().name.cs)
            res.json(result)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

    async getAllResults(req, res) {
        try {
            const results = await resultService.getAllResults()
            res.json(results)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

    async deleteSurveyResults(req, res) {
        try {
            const results = await resultService.deleteSurveyResults(req.params.id)
            res.json(results)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

    async getExcelResults(req, res) {
        try {
            const results = await resultService.getSurveyResults(req.params.id)
            const survey = await surveyService.getSurvey(req.params.id)
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
            const surveys = await surveyService.getSurveys(req.params.userId)
            let excelFile = await excelHelper.generateExcel()
            for (let survey of surveys) {
                const results = await resultService.getSurveyResults(survey._id)
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