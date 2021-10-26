import express from 'express'
const router = express.Router()

import { verifyToken } from '../auth/auth.js'

import userController from '../controllers/user.controller.js'
import surveyController from '../controllers/survey.controller.js'
import resultsController from '../controllers/result.controller.js'
import playController from '../controllers/play.controller.js'
import logController from '../controllers/log.controller.js'

router.get('/api/users', userController.getAll)
router.post('/api/users/login', userController.login)
router.post('/api/users/register', userController.register)
router.post('/api/users/changeusername', verifyToken, userController.changeUsername)

router.get('/api/ankety', verifyToken, surveyController.getAll)
router.get('/api/ankety/ivet', surveyController.getIvetSurveys)
router.post('/api/ankety', verifyToken, surveyController.createAnketa)
router.get('/api/ankety/:id', verifyToken, surveyController.getOne)
router.delete('/api/ankety/:id', verifyToken, surveyController.deleteAnketa)
router.put('/api/ankety/:id', verifyToken, surveyController.updateSurvey)
router.put('/api/ankety/:id/enabled', verifyToken, surveyController.enableSurvey)
router.post('/api/ankety/duplicate/:id', verifyToken, surveyController.duplicateSurvey)

router.get('/api/results/excelAll/:userId', resultsController.getAllExcelResults)
router.get('/api/results/:id', verifyToken, resultsController.getSurveyResults)
router.post('/api/raw/results', resultsController.getAllResults)
router.post('/api/results', resultsController.postSurveyResult)
router.delete('/api/results/:id', verifyToken, resultsController.deleteSurveyResults)
router.get('/api/results/:id/excel', resultsController.getExcelResults)

router.get('/api/play/:id', playController.getAnketa)

router.get('/logs', logController.getLogs)


export default router
