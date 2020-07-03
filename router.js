import express from 'express'
const router = express.Router()

import userController from './controllers/user.controller.js'

router.get('/api/users/login', userController.login)
router.get('/api/users/register', userController.login)

// export default router
export default router
