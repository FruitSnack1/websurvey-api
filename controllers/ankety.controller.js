import Anketa from '../models/anketa.model.js'
import qrcode from 'qrcode'

class AnketyController {
    async createAnketa(req, res) {
        req.body.user_id = req.user.id
        const anketa = new Anketa(req.body)
        try {
            const newAnketa = await anketa.save()
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

    async getQRCode(req, res) {
        console.log(req.params.id)
        qrcode.toFile(`public/images/qrcodes/${req.params.id}.png`, `localhost:3001/play/${req.params.id}`, () => {
            res.redirect(`http://localhost:3001/qrcodes/${req.params.id}.png`)
        })
    }
}

const anketyController = new AnketyController()
export default anketyController