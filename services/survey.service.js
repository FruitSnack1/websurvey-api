import Survey from '../models/survey.model.js'

class SurveyService {
    async getSurvey(id){
        return await Survey.findOne({_id: id})
    }

    async getSurveys(userId){
        return await Survey.find({user_id: userId})
    }
}

const surveyService = new SurveyService()
export default surveyService