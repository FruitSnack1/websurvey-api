require('dotenv').config()

var express = require('express');
var router = express.Router();

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://127.0.0.1:27017/quiz';
const jsonexport = require('jsonexport');
const jwt = require('jsonwebtoken');

router.post('/anketa', (req,res) =>{
  let result = JSON.parse(req.body.result);
  result.anketaId = new mongodb.ObjectId(result.anketaId);
  MongoClient.connect(url, async (err, client) =>{
    if (err) return console.log(err);
    const db = client.db("quiz");
    const collection = db.collection('results');
    const anketa = await collection.insertOne(result);
    res.sendStatus(200);
  });
});

router.get('/anketa/:id', authenticateToken, (req,res) =>{
  MongoClient.connect(url, async (err, client) =>{
    if (err) return console.log(err);
    const db = client.db("quiz");
    const collection = db.collection('ankety');
    const anketa = await collection.aggregate([
      {
        '$match': {
          '_id': new mongodb.ObjectId(req.params.id)
        }
      }, {
        '$lookup': {
          'from': 'results',
          'localField': '_id',
          'foreignField': 'anketaId',
          'as': 'results'
        }
      }
    ]).toArray();
    console.log(anketa);
    res.render('quiz-anketa-results',{anketa : anketa[0]});
  });
});


function authenticateToken(req, res, next) {
  const token = req.cookies['accessToken'];
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

module.exports = router;
