import Anketa from '../models/anketa.model.js'
import qrcode from 'qrcode'
import mongoose from 'mongoose'

class AnketyController {
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
            const anketa = new Anketa(obj)
            try {
                const newAnketa = await anketa.save()
                qrcode.toFile(`public/qrcodes/${newAnketa._id}.png`, `localhost:4200/play/${newAnketa._id}`, () => {
                })
                res.status(201).json(newAnketa)
            } catch (err) {
                res.status(400).json({ err: err.message })
            }
        }
        if (obj.type === 2) {
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
            try {
                const anketa = new Anketa(obj)
                const newSurvey = await anketa.save()
                qrcode.toFile(`public/qrcodes/${newSurvey._id}.png`, `localhost:4200/play/${newSurvey._id}`, () => {
                })
                res.status(201).json(newSurvey)
            } catch (err) {
                res.status(400).json({ err: err.message })
            }
        }

    }

    async updateSurvey(req, res) {
        const obj = JSON.parse(req.body.anketa)
        if (obj.type === 2) {
            console.log(req.files)
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
                const survey = await Anketa.findById(req.params.id);
                for (let i = 0; i < obj.questions.length; i++) {
                    if (!obj.questions[i].img && survey.questions.length >= obj.questions.length)
                        obj.questions[i].img = survey.questions[i].img
                }
                const updatedSurvey = await Anketa.findOneAndUpdate({ _id: req.params.id }, obj)
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
            console.log(obj)
            try {
                const survey = await Anketa.findById(req.params.id);
                for (let i = 0; i < obj.questions.length; i++) {
                    if (!obj.questions.img && survey.questions.length >= obj.questions.length)
                        obj.questions[i].img = survey.questions[i].img
                }
                const updatedSurvey = await Anketa.findOneAndUpdate({ _id: req.params.id }, obj)
                res.status(201).json(updatedSurvey)
            } catch (err) {
                res.status(400).json({ err: err.message })
            }
        }
    }

    async getAll(req, res) {
        console.log(req.user)
        try {
            const ankety = await Anketa.aggregate([
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

    async getOne(req, res) {
        try {
            // const anketa = await Anketa.find({ user_id: req.user.id, _id: req.params.id })
            const anketa = await Anketa.aggregate([
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
            console.log(anketa);
            res.json(anketa[0])
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

    async deleteAnketa(req, res) {
        try {
            await Anketa.findByIdAndDelete(req.params.id)
            res.json({ message: 'Anketa removed' })
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

}

const anketyController = new AnketyController()
export default anketyController