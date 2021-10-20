import Log from '../models/log.model.js'

class LogController{
    async getLogs(req, res){
        const logs = await Log.find().populate('user')
        res.json(logs)
    }
}

const logController = new LogController()
export default logController