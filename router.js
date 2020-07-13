import express from 'express'
const router = express.Router()

import userController from './controllers/user.controller.js'
import anketyController from './controllers/ankety.controller.js'

router.get('/api/users', userController.getAll)
router.post('/api/users/login', userController.login)
router.post('/api/users/register', userController.register)

router.get('/api/ankety', userController.getAll)
router.post('/api/ankety', userController.getAll)
router.get('/api/ankety/:id', userController.getAll)
router.delete('/api/ankety/:id', userController.getAll)


export default router