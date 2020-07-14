import Anketa from '../models/anketa.model.js'

class AnketyController {
    async createAnketa(req, res) {
        console.log(req.body)
        req.body.user_id = req.user.id
        const anketa = new Anketa(req.body)
        console.log(anketa)
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
}

const anketyController = new AnketyController()
export default anketyController