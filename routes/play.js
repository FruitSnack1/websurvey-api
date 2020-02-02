require('dotenv').config()

var express = require('express');
var router = express.Router();

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = 'mongodb://127.0.0.1:27017/quiz';
const jsonexport = require('jsonexport');

router.get('/:id', (req,res) =>{
  MongoClient.connect(url, async (err, client) =>{
    if (err) return console.log(err);
    const db = client.db("quiz");
    const collection = db.collection('ankety');
    const anketa = await collection.findOne({'_id': new mongodb.ObjectId(req.params.id)});
    console.log(anketa);
    res.render('quiz-play',{anketa});
  });
});

module.exports = router;
