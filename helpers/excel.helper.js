import excel from 'excel4node'

class ExcelHelper {
    async generateExcel() {
        return new excel.Workbook()
    }

    async addList(file, survey, results) {
        survey = survey.toJSON()
        let ws = file.addWorksheet(survey.name.cs)

        const question = (id) => {
            id = String(id)
            for (let q of survey.questions) {
                if (q._id == id) return q
            }
        }

        const style = file.createStyle({
            font: {
                bold: true
            }
        })

        ws.cell(1, 1).string('id').style(style)
        ws.cell(1, 2).string('Otázka').style(style)
        ws.cell(1, 3).string('Popis otázky').style(style)
        ws.cell(1, 4).string('Typ otázky').style(style)
        ws.cell(1, 5).string('Odpověď').style(style)
        ws.cell(1, 6).string('Datum').style(style)
        ws.cell(1, 7).string('Čas odpovědi').style(style)

        let row = 2
        for (let i = 0; i < results.length; i++) {
            for (let j = 0; j < results[i].answers.length; j++) {
                ws.cell(row, 1).string(String(results[i]._id))
                ws.cell(row, 2).string(question(results[i].answers[j].question_id).question.cs)
                ws.cell(row, 3).string(question(results[i].answers[j].question_id).description)
                let type
                if (question(results[i].answers[j].question_id).type == 'single') type = 'Výběr z možností'
                if (question(results[i].answers[j].question_id).type == 'open') type = 'Otevřená otázka'
                if (question(results[i].answers[j].question_id).type == 'scale') type = 'Škála'
                ws.cell(row, 4).string(type)
                ws.cell(row, 5).string(results[i].answers[j].answer[0])
                ws.cell(row, 6).date(new Date(results[i].date)).style({ numberFormat: 'dd.mm.yyyy' })
                ws.cell(row, 7).number(results[i].answers[j].time)
                row++
            }
        }
        return file
    }

}

const excelHelper = new ExcelHelper()
export default excelHelper