import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import router from './routes/router.js'
import bodyParser from 'body-parser'
import path from 'path'

const app = express()

app.use(bodyParser.json({ extended: false }))
app.use(express.static('public'))
app.use(cors({ credentials: true, origin: 'http://localhost:4200' }))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200')
    res.header('Access-Control-Allow-Headers', 'Origin, *')
    res.header('Access-Control-Allow-Credentials', true)
    next()
})

app.use(cookieParser());
app.use('/', router)

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())

app.listen(3001)