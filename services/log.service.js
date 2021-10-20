import Log from '../models/log.model.js'
import mongoose from 'mongoose'

class LogService{
    async login(req){
        console.log(req.user)
        const log = new Log({
            action: 'login',
            user: req.user.id,
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        })
        await log.save()
    }
}

const logService = new LogService()
export default logService