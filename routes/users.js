require('dotenv').config()

var express = require('express');
var router = express.Router();

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://127.0.0.1:27017/quiz';
const jsonexport = require('jsonexport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

router.get('/protected', authenticateToken, (req,res)=>{
  res.send('you re good');
});

router.get('/users', (req, res) => {
  res.send({
    'count': 1
  })
});

router.get('/login', (req, res) => {
  MongoClient.connect(url, async (err, client) => {
    if (err) return console.log('Unable to connect to the Server', err);
    const db = client.db("quiz");
    const users = await db.collection('users').find({}, {
      projection: {
        password: 0
      }
    }).toArray();
    res.render('login', {
      users
    });
  });
});

router.post('/login', (req,res) =>{
  const id = mongodb.ObjectId(req.body.id);
  const password = req.body.password;

  const hash = crypto.createHash('md5').update(password).digest('hex');

  MongoClient.connect(url, async (err, client) => {
    if (err) return console.log('Unable to connect to the Server', err);
    const db = client.db("quiz");
    await db.collection('users').find({'_id': id}).toArray((err, result) =>{
      if(err) console.log(err);
      const dbUser = result[0];
      if(hash === dbUser.password){

        const user = { 'id' : dbUser._id, 'username': dbUser.username };
        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

        //save refreshToken

        res.cookie('accessToken', accessToken);
        res.cookie('refreshToken', refreshToken);
        res.redirect('/admin')
      }else{
        res.send('wrong password');
      }
    });
  });
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const confirmed_password = req.body.confirmed_password;

  const hash = crypto.createHash('md5').update(password).digest('hex');

  MongoClient.connect(url, async (err, client) => {
    if (err) return console.log('Unable to connect to the Server', err);
    const db = client.db("quiz");
    db.collection('users').insertOne(
      {
        'username' : username,
        'password' : hash
      }
    );
    res.redirect('/users/login');
  });
});


function getUser(id) {
  MongoClient.connect(url, async (err, client) => {
    if (err) return console.log('Unable to connect to the Server', err);
    const db = client.db("quiz");
    const user = await db.collection(`users`).find({
      '_id': mongodb.ObjectId(id)
    });
    return user;
  });
}

function generateAccessToken(data) {
  return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET)
}

function authenticateToken(req, res, next) {
  const token = req.cookies['accessToken'];
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err)
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

module.exports = router;
