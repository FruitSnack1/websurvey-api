
var express = require('express');
var router = express.Router();

const Anketa = require('../models/anketa')

router.get('/:id', (req,res) =>{
  try{
    const anketa = Anketa.findById(req.params._id)

  }catch(err){
    res.status(500).json({message:err.message})
  }

  MongoClient.connect(url, async (err, client) =>{
    if (err) return console.log(err);
    const db = client.db("quiz");
    const collection = db.collection('ankety');
    const anketa = await collection.findOne({'_id': new mongodb.ObjectId(req.params.id)});
    console.log(anketa);
  });
});

module.exports = router;
