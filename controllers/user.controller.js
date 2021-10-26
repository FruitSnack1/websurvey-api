import logService from '../services/log.service.js'
import userService from '../services/user.service.js'

class UserController {

    async login(req, res) {
        try {
            const { sucess, username, accessToken, id } = await userService.login(req.body.id, req.body.password)
            if(!sucess)
                res.json({ message: 'wrong password' })
            else{
                req.user = { id, username }
                logService.logAction('login',req)
                res.status(200).json({ message: 'logged in', username, accessToken, id })
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: err.message })
        }
    }

    async register(req, res) {
        try {
            const user = await userService.register(req.body.username, req.body.password)
            res.status(201).json(user)
        } catch (err) {
            res.status(400).json({ message: err.message })
        }
    }

    async getAll(req, res) {
        try {
            const users = await userService.getAll()
            res.json(users)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

    async changeUsername(req, res) {
        try {
            const { username } = await userService.changeUsername(req.user.id, req.body.username)
            res.json({ username})
        } catch (err) {
            res.status(400).json({ message: err.message })
        }
    }
    
}

const userController = new UserController()
export default userController