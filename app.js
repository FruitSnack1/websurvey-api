require('dotenv').config()

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
const cors = require('cors')

app.use(cors({credentials: true, origin: 'http://localhost:4200'}))

app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200')
    res.header('Access-Control-Allow-Headers', 'Origin, *')
    res.header('Access-Control-Allow-Credentials', true)
    next()
})

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())
app.use(cookieParser());

const usersRouter = require('./routes/users')
app.use('/api/users', usersRouter)

const anketyRouter = require('./routes/ankety')
app.use('/api/ankety', anketyRouter)

const playRouter = require('./routes/play')
app.use('/api/play', playRouter)

const resultsRouter  = require('./routes/results')
app.use('/api/results', resultsRouter)

app.listen(3001)