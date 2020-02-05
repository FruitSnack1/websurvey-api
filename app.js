require('dotenv').config()

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())
app.use(cookieParser());

const usersRouter = require('./routes/users')
app.use('/users', usersRouter)

const anketyRouter = require('./routes/ankety')
app.use('/ankety', anketyRouter)

const playRouter = require('./routes/play')
app.use('/play', playRouter)

const resultsRouter  = require('./routes/results')
app.use('/results', resultsRouter)

app.listen(3000)