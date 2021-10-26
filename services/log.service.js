import Log from '../models/log.model.js'
import geoip from 'geoip-lite'

class LogService{
    async logAction(action, req, survey = ''){
        try {
            const geo = geoip.lookup(req.headers['x-forwarded-for'] || req.connection.remoteAddress)
            const log = {
                action,
                ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                city: geo?.city ? geo?.city : '-',
                survey
            }
            if(req.user)
                log.user = req.user.id
            await new Log(log).save()
        } catch (err) {
            console.log(err)            
        }
    }
}

const logService = new LogService()
export default logService