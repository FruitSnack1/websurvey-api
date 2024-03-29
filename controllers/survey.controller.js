import Survey from '../models/survey.model.js'
import User from '../models/user.model.js'
import qrcode from 'qrcode'
import mongoose from 'mongoose'
import fs from 'fs'
import imagemin from 'imagemin'
import imageminPngquant from 'imagemin-pngquant'
import imageminJpegtran from 'imagemin-jpegtran'
import logService from '../services/log.service.js'

class SurveyController {
    async createAnketa(req, res) {
        const obj = JSON.parse(req.body.anketa)
        if (obj.type === 1) {
            const languages = obj.languages
            for (let propName in obj.name) {
                if (!languages.includes(propName)) {
                    delete obj.name[propName]
                }
            }
            for (let propName in obj.description) {
                if (!languages.includes(propName))
                    delete obj.description[propName]
            }
            for (let i = 0; i < obj.answers.length; i++) {
                for (let propName in obj.answers[i].answer) {
                    if (!languages.includes(propName))
                        delete obj.answers[i].answer[propName]
                }
            }
            for (let i = 0; i < obj.questions.length; i++) {
                for (let propName in obj.questions[i].question) {
                    if (!languages.includes(propName))
                        delete obj.questions[i].question[propName]
                }
            }
            if (req.files) {
                for (let i = 0; i < obj.questions.length; i++) {
                    obj.questions[i]._id = new mongoose.Types.ObjectId()
                    const path = `./public/images/${obj.questions[i]._id}.png`
                    if (!req.files[`img${i}`])
                        continue
                    obj.questions[i].img = path.substring(8, path.length)
                    req.files[`img${i}`].mv(path)
                }
            }
            obj.user_id = req.user.id
            const anketa = new Survey(obj)
            try {
                const newAnketa = await anketa.save()
                qrcode.toFile(`public/qrcodes/${newAnketa._id}.png`, `https://skodaquiz.com/play/${newAnketa._id}`, { width: 1024 }, () => {
                })
                logService.logAction('create', req, newAnketa.toJSON().name.cs)
                res.status(201).json(newAnketa)
            } catch (err) {
                res.status(400).json({ err: err.message })
            }
        }
        if (obj.type === 2) {
            if (req.files) {
                for (let i = 0; i < obj.questions.length; i++) {
                    obj.questions[i]._id = new mongoose.Types.ObjectId()
                    let path = `./public/images/${obj.questions[i]._id}.png`
                    if (!req.files[`img${i}`])
                        continue
                    obj.questions[i].img = path.substring(8, path.length)
                    req.files[`img${i}`].mv(path, err => {
                        if (err) console.log(err)
                        path = path.substring(2)
                        imagemin([path], {
                            destination: 'public/images',
                            plugins: [
                                imageminPngquant({
                                    quality: [0.3, 0.5]
                                }),
                                imageminJpegtran({
                                    progressive: true
                                })
                            ]
                        })
                    })
                }
            }
            obj.user_id = req.user.id
            try {
                const anketa = new Survey(obj)
                const newSurvey = await anketa.save()
                qrcode.toFile(`public/qrcodes/${newSurvey._id}.png`, `https://skodaquiz.com/play/${newSurvey._id}`, { width: 1024 }, () => {
                })
                logService.logAction('create', req, newSurvey.toJSON().name.cs)
                res.status(201).json(newSurvey)
            } catch (err) {
                res.status(400).json({ err: err.message })
            }
        }

    }

    async updateSurvey(req, res) {
        const obj = JSON.parse(req.body.anketa)
        if (obj.type === 2) {
            if (req.files) {
                for (let i = 0; i < obj.questions.length; i++) {
                    obj.questions[i]._id = new mongoose.Types.ObjectId()
                    if (!req.files[`img${i}`])
                        continue
                    const path = `./public/images/${obj.questions[i]._id}.png`
                    obj.questions[i].img = path.substring(8, path.length)
                    req.files[`img${i}`].mv(path)
                }
            }

            try {
                const survey = await Survey.findById(req.params.id)
                for (let i = 0; i < obj.questions.length; i++) {
                    if (!obj.questions[i].img && survey.questions.length >= obj.questions.length)
                        obj.questions[i].img = survey.questions[i].img
                }
                obj.updated = Date.now()
                const updatedSurvey = await Survey.findOneAndUpdate({ _id: req.params.id }, obj)
                logService.logAction('update', req, updatedSurvey.toJSON().name.cs)
                res.status(201).json(updatedSurvey)
            } catch (err) {
                res.status(400).json({ err: err.message })
            }
        } else {

            const languages = obj.languages
            for (let propName in obj.name) {
                if (!languages.includes(propName)) {
                    delete obj.name[propName]
                }
            }
            for (let propName in obj.description) {
                if (!languages.includes(propName))
                    delete obj.description[propName]
            }
            for (let i = 0; i < obj.answers.length; i++) {
                for (let propName in obj.answers[i].answer) {
                    if (!languages.includes(propName))
                        delete obj.answers[i].answer[propName]
                }
            }
            for (let i = 0; i < obj.questions.length; i++) {
                for (let propName in obj.questions[i].question) {
                    if (!languages.includes(propName))
                        delete obj.questions[i].question[propName]
                }
            }
            if (req.files) {
                for (let i = 0; i < obj.questions.length; i++) {
                    obj.questions[i]._id = new mongoose.Types.ObjectId()
                    if (!req.files[`img${i}`])
                        continue
                    const path = `./public/images/${obj.questions[i]._id}.png`
                    obj.questions[i].img = path.substring(8, path.length)
                    req.files[`img${i}`].mv(path)
                }
            }
            obj.user_id = req.user.id
            try {
                const survey = await Survey.findById(req.params.id)
                for (let i = 0; i < obj.questions.length; i++) {
                    if (!obj.questions.img && survey.questions.length >= obj.questions.length)
                        obj.questions[i].img = survey.questions[i].img
                }
                obj.updated = Date.now()
                const updatedSurvey = await Survey.findOneAndUpdate({ _id: req.params.id }, obj)
                logService.logAction('update', req, updatedSurvey.toJSON().name.cs)
                res.status(201).json(updatedSurvey)
            } catch (err) {
                res.status(400).json({ err: err.message })
            }
        }
    }

    async getAll(req, res) {
        try {
            const ankety = await Survey.aggregate([
                {
                    $match: {
                        user_id: mongoose.Types.ObjectId(req.user.id)
                    }
                }, {
                    $lookup: {
                        from: 'results',
                        localField: '_id',
                        foreignField: 'anketa_id',
                        as: 'results'
                    }
                }, {
                    $addFields: {
                        result_count: {
                            $size: '$results'
                        }
                    }
                }, {
                    $project: {
                        results: 0
                    }
                }
            ])
            res.json(ankety)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

    async getIvetSurveys(req, res) {
        try {
            const { id } = await User.findOne({ username: 'IVET' })
            const surveys = await Survey.find({ user_id: id })
            res.json(surveys)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }

    }

    async getOne(req, res) {
        try {
            // const anketa = await Anketa.find({ user_id: req.user.id, _id: req.params.id })
            const anketa = await Survey.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(req.params.id)
                    }
                },
                {
                    $lookup: {
                        from: 'results',
                        localField: '_id',
                        foreignField: 'anketa_id',
                        as: 'results'
                    }
                }, {
                    $addFields: {
                        result_count: {
                            $size: '$results'
                        }
                    }
                }, {
                    $project: {
                        results: 0
                    }
                }
            ])
            res.json(anketa[0])
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

    async deleteAnketa(req, res) {
        try {
            const survey = await Survey.findById(req.params.id)
            for (let question of survey.questions) {
                if (question.img)
                    fs.unlink(`public${question.img}`, err => { if (err) console.log(err) })
            }

            const deleted = await Survey.findByIdAndDelete(req.params.id)
            logService.logAction('delete', req, deleted.toJSON().name.cs)
            res.json({ message: 'Survey removed' })
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

    async enableSurvey(req, res) {
        try {
            const updatedSurvey = await Survey.findOneAndUpdate({ _id: req.params.id }, { enabled: req.body.enabled })
            res.json(updatedSurvey)
        } catch (error) {
            res.status(500).json({ message: err.message })
        }
    }

    async duplicateSurvey(req, res) {
        try {
            const survey = await Survey.findById(req.params.id).exec()
            survey._id = new mongoose.Types.ObjectId()
            survey.name = { cs: `${survey.name.get('cs')} kopie` }
            survey.isNew = true
            const newSurvey = await survey.save()
            qrcode.toFile(`public/qrcodes/${newSurvey._id}.png`, `https://skodaquiz.com/play/${newSurvey._id}`, { width: 1024 }, () => { })
            logService.logAction('create', req, newSurvey.toJSON().name.cs)
            res.json(newSurvey)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

}

const surveyController = new SurveyController()
export default surveyController