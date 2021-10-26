import Result from '../models/result.model.js'
import mongoose from 'mongoose'

class ResultService {

    async getSurveyResults(surveyId){
        return await Result.find({ anketa_id: surveyId })
    }

    async postSurveyResult(result){
        result.anketa_id = new mongoose.Types.ObjectId(result.anketa_id)
        const newResult = new Result(result)
        return await newResult.save()
    }

    async getAllResults(){
        return await Result.find()
    }

    async deleteSurveyResults(id){
        return await Result.deleteMany({ anketa_id: id })
    }

}

const resultService = new ResultService()
export default resultService