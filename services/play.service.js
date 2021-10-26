import Survey from "../models/survey.model.js"

class PlayService {

    async getSurvey(id){
        return await Survey.findById(id)
    }

}

const playService = new PlayService()
export default playService
