import Log from '../models/log.model.js'
import geoip from 'geoip-lite'

class LogService{
    async login(req){
        try {
            const geo = geoip.lookup(req.headers['x-forwarded-for'] || req.connection.remoteAddress)
            const log = new Log({
                action: 'login',
                user: req.user.id,
                ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                city: geo?.city ? geo?.city : '-'
            })
            await log.save()
        } catch (err) {
            console.log(err)            
        }
    }
}

const logService = new LogService()
export default logService