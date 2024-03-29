import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import router from './routes/router.js'
import bodyParser from 'body-parser'
import fileUpload from 'express-fileupload'
import https from 'https'
import fs from 'fs'

const PROD = ((process.env.ENV == 'PROD') ? true : false)

if (PROD) console.log('Server running in production settings')
else console.log('Server running in devel settings')

const app = express()

app.use(cookieParser())
app.use(bodyParser.json({ extended: false }))
app.use(express.static('public'))
if (PROD)
    app.use(cors({ credentials: true, origin: 'https://skodaquiz.com' }))
else
    app.use(cors({ credentials: true, origin: 'http://localhost:4200' }))

app.use(fileUpload())

//public/images
if (!fs.existsSync('./public')) fs.mkdirSync('./public')
if (!fs.existsSync('./public/images')) fs.mkdirSync('./public/images')
if (!fs.existsSync('./public/qrcodes')) fs.mkdirSync('./public/qrcodes')


app.use((req, res, next) => {
    if (PROD)
        res.header('Access-Control-Allow-Origin', 'https://skodaquiz.com')
    else
        res.header('Access-Control-Allow-Origin', 'http://localhost:4200')
    res.header('Access-Control-Allow-Credentials', true)
    next()
})

app.use('/', router)

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())

if (PROD) {
    app.listen(3001)
    // const options = {
    //     key: fs.readFileSync('./cert.key'),
    //     cert: fs.readFileSync('./cert.crt')
    // }
    // https.createServer(options, app).listen(3001)
} else {
    app.listen(3001)
}