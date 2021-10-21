import excel from 'excel4node'

class ExcelHelper {
    async generateExcel() {
        return new excel.Workbook()
    }

    async addList(file, survey, results) {
        try {
            survey = survey.toJSON()
            let ws = file.addWorksheet(survey.name.cs)

            const style = file.createStyle({
                font: {
                    bold: true
                }
            })

            ws.cell(1, 1).string('id').style(style)
            ws.cell(1, 2).string('Otázka').style(style)
            ws.cell(1, 3).string('Popis otázky').style(style)
            ws.cell(1, 4).string('Odpověď').style(style)
            ws.cell(1, 5).string('Datum').style(style)
            ws.cell(1, 6).string('Čas odpovědi').style(style)

            let row = 2
            for(let i = 0; i< survey.questions.length; i++){
                for (let j = 0; j < results.length; j++) {
                    ws.cell(row, 1).string(String(results[j]._id))
                    ws.cell(row, 2).string(String(survey.questions[i].question.cs))
                    ws.cell(row, 3).string(String(survey.questions[i].description))
                    ws.cell(row, 4).string(results[j].answers[i].answer[0])
                    ws.cell(row, 5).date(new Date(results[j].date)).style({ numberFormat: 'dd/mm/yy' })
                    ws.cell(row, 6).number(results[j].answers[i].time)
                    row++
                }
            }
            return file
        } catch (error) {
            console.log(error)
        }
        
    }

}

const excelHelper = new ExcelHelper()
export default excelHelper