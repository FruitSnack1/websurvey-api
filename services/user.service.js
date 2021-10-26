import { generateAccessToken } from '../auth/auth.js'
import User from '../models/user.model.js'
import cryptoJs from 'crypto-js'


class UserService{

    async login(id, password){
        try {
            const user = await User.findById(id)
            const { username } = user
            const hash = cryptoJs.SHA256(password + user.salt).toString()
            if (hash !== user.password)
                return { sucess: false }
            const tokenUser = { 'id': user._id, 'username': user.username }
            const accessToken = generateAccessToken(tokenUser)
            return { sucess: true, username, accessToken, id}
        } catch (err) {
            console.log(err)
        }
    }

    async register(username, password){
        const salt = cryptoJs.lib.WordArray.random(128 / 8)
        const hash = cryptoJs.SHA256(password + salt).toString()

        const user = new User({
            username,
            password: hash,
            salt
        })
        return await user.save()
    }

    async getAll(){
        return await User.find({}, '_id username')
    }

    async changeUsername(id, username){
        const user = await User.findById(id)
        user.username = username
        return await user.save()
    }
    
}

const userService = new UserService()
export default userService