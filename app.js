// import 'dotenv'.config()
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
const app = express()
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import router from './router.js'
import bodyParser from 'body-parser'

app.use(bodyParser.json({ extended: false }))

app.use(cors({ credentials: true, origin: 'http://localhost:4200' }))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200')
    res.header('Access-Control-Allow-Headers', 'Origin, *')
    res.header('Access-Control-Allow-Credentials', true)
    next()
})

app.use('/', router)

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())
app.use(cookieParser());

// const usersRouter = require('./routes/users')
// app.use('/api/users', usersRouter)

// const anketyRouter = require('./routes/ankety')
// app.use('/api/ankety', anketyRouter)

// const playRouter = require('./routes/play')
// app.use('/api/play', playRouter)

// const resultsRouter  = require('./routes/results')
// app.use('/api/results', resultsRouter)

app.listen(3001)