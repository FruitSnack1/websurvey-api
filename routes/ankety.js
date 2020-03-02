const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const fs = require('fs');
const rimraf = require('rimraf');
const mongoose = require('mongoose')

const Anketa = require('../models/anketa')

router.post('/', authenticateToken, async (req, res) => {
    req.body.user_id = req.user.id
    const anketa = new Anketa(req.body)
    console.log(anketa)
    try {
        const newAnketa = await anketa.save()
        res.status(201).json(newAnketa)
    } catch (err) {
        res.status(400).json({err: err.message})
    }
})

router.get('/', authenticateToken, async (req,res)=>{
    // console.log(req.user)
    try{
        const ankety = await Anketa.find({user_id: req.user.id})
        res.json(ankety)
    }catch(err){
        res.status(500).json({message:err.message})
    }
})

router.get('/:id', authenticateToken, async (req,res)=>{
    try{
        const anketa = await Anketa.find({user_id: req.user.id, _id:req.params.id})
        res.json(anketa[0])
    }catch(err){
        res.status(500).json({message:err.message})
    }
})

router.delete('/:id', authenticateToken, async (req,res)=>{
    try{
        await Anketa.findByIdAndDelete(req.params.id)
        res.json({message:'Anketa removed'})
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
