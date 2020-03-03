
// router.post('/anketa', (req,res) =>{
//   let result = JSON.parse(req.body.result);
//   result.anketaId = new mongodb.ObjectId(result.anketaId);
//   MongoClient.connect(url, async (err, client) =>{
//     if (err) return console.log(err);
//     const db = client.db("quiz");
//     const collection = db.collection('results');
//     const anketa = await collection.insertOne(result);
//     res.sendStatus(200);
//   });
// });

// router.get('/anketa/:id', authenticateToken, (req,res) =>{
//   MongoClient.connect(url, async (err, client) =>{
//     if (err) return console.log(err);
//     const db = client.db("quiz");
//     const collection = db.collection('ankety');
//     const anketa = await collection.aggregate([
//       {
//         '$match': {
//           '_id': new mongodb.ObjectId(req.params.id)
//         }
//       }, {
//         '$lookup': {
//           'from': 'results',
//           'localField': '_id',
//           'foreignField': 'anketaId',
//           'as': 'results'
//         }
//       }
//     ]).toArray();
//     console.log(anketa);
//     res.render('quiz-anketa-results',{anketa : anketa[0]});
//   });
// });


var express = require('express');
var router = express.Router();

const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');

const Result = require('../models/result')

router.post('/', async (req,res)=>{
  if(!req.body.anketa_id)
    res.json({message:'Missing anketa id'})
  req.body.anketa_id = new mongoose.Types.ObjectId(req.body.anketa_id)
  try{
    const newResult = await new Result(req.body).save()
    res.json(newResult)
  }catch(err){
    res.status(500).json({message:err.message})
  }
})

router.get('/:id', authenticateToken, async (req,res) =>{
  try{
    const results = await Result.find({
      anketa_id: req.params.id
    })
    res.json(results)
  }catch(err){
    res.status(500).json({message:err.message})
  }
})

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
