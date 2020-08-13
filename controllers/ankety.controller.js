import Anketa from '../models/anketa.model.js'
import qrcode from 'qrcode'
import mongoose from 'mongoose'

class AnketyController {
    async createAnketa(req, res) {
        const obj = JSON.parse(req.body.anketa)
        if (req.files) {
            for (let i = 0; i < obj.questions.length; i++) {
                const path = `./public/images/${obj.questions[i].id}.png`
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

    async getAll(req, res) {
        try {
            const ankety = await Anketa.find({ user_id: req.user.id })
            res.json(ankety)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

    async getOne(req, res) {
        try {
            const anketa = await Anketa.find({ user_id: req.user.id, _id: req.params.id })
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