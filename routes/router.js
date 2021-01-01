import express from 'express'
const router = express.Router()

import { verifyToken } from '../auth/auth.js'

import userController from '../controllers/user.controller.js'
import anketyController from '../controllers/ankety.controller.js'
import resultsController from '../controllers/results.controller.js'
import playController from '../controllers/play.controller.js'

router.get('/api/users', userController.getAll)
router.post('/api/users/login', userController.login)
router.post('/api/users/register', userController.register)
router.post('/api/users/changeusername', verifyToken, userController.changeUsername)

router.get('/api/ankety', anketyController.getAll)
router.post('/api/ankety', verifyToken, anketyController.createAnketa)
router.get('/api/ankety/:id', verifyToken, anketyController.getOne)
router.delete('/api/ankety/:id', verifyToken, anketyController.deleteAnketa)
router.put('/api/ankety/:id', verifyToken, anketyController.updateSurvey)

router.get('/api/results/:id', verifyToken, resultsController.getAnketaResults)
router.post('/api/raw/results', resultsController.getAllResults)
router.post('/api/results', resultsController.postAnketaResult)

router.get('/api/play/:id', playController.getAnketa)


export default router