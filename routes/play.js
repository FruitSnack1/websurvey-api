
var express = require('express');
var router = express.Router();

const Anketa = require('../models/anketa')

router.get('/:id', async (req,res) =>{
  try{
    const anketa = await Anketa.findById(req.params.id)
    res.json(anketa)
  }catch(err){
    res.status(500).json({message:err.message})
  }
});

module.exports = router;
