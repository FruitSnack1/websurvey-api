import playService from '../services/play.service.js'

class PlayController {
    async getAnketa(req, res) {
        try {
            const survey = await playService.getSurvey(req.params.id)
            if (survey.enabled === false)
                res.json({ enabled: false })
            else
                res.json(survey)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }
}

const playController = new PlayController()
export default playController