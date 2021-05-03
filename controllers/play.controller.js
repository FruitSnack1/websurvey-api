import Anketa from '../models/anketa.model.js'

class PlayController {
    async getAnketa(req, res) {
        try {
            const anketa = await Anketa.findById(req.params.id)
            if (anketa.enabled === false)
                res.json({ enabled: false })
            else
                res.json(anketa)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }
}

const playController = new PlayController()
export default playController