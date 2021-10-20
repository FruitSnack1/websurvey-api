import { generateAccessToken, genereateRefreshToken } from '../auth/auth.js'

import cryptoJs from 'crypto-js'
import User from '../models/user.model.js'
import logService from '../services/log.service.js'

class UserController {
    async login(req, res) {
        try {
            const user = await User.findById(req.body.id)
            const { username } = user
            const hash = cryptoJs.SHA256(req.body.password + user.salt).toString()
            if (hash !== user.password)
                return res.json({ message: 'wrong password' })

            const tokenUser = { 'id': user._id, 'username': user.username };
            const accessToken = generateAccessToken(tokenUser);
            const refreshToken = generateAccessToken(tokenUser);
            req.user = tokenUser
            //save refreshToken
            logService.login(req)
            res.status(200).json({ message: 'logged in', username, accessToken, id: user._id })

        } catch (err) {
            console.log(err);

            res.status(500).json({ message: err.message })
        }
    }

    async register(req, res) {
        try {
            console.log(req.body)
            const salt = cryptoJs.lib.WordArray.random(128 / 8)
            const hash = cryptoJs.SHA256(req.body.password + salt).toString()

            const user = new User({
                username: req.body.username,
                password: hash,
                salt
            })
            const newUser = await user.save()
            res.status(201).json(newUser)
        } catch (err) {
            res.status(400).json({ message: err.message })
        }
    }

    async getAll(req, res) {
        try {
            const users = await User.find({}, '_id username')
            res.json(users)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    }

    async changeUsername(req, res) {
        try {
            const user = await User.findById(req.user.id);
            user.username = req.body.username
            user.save()
            res.json({ username: user.username })
        } catch (err) {
            req.status(400).json({ message: err.message })
        }
    }
}

const userController = new UserController()
export default userController