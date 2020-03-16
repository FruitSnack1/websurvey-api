const auth = require('../auth.js') 

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

router.get('/:id', auth.authenticateToken, async (req,res) =>{
  try{
    const results = await Result.find({
      anketa_id: req.params.id
    })
    res.json(results)
  }catch(err){
    res.status(500).json({message:err.message})
  }
})


module.exports = router;
