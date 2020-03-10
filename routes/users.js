const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const cryptoJs = require('crypto-js')

const User = require('../models/user')

router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '_id username')
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const user = await User.findById(req.body.id)
    const hash = cryptoJs.SHA256(req.body.password).toString()
    if (hash !== user.password)
      res.send('wrong password')

    const tokenUser = { 'id': user._id, 'username': user.username };
    const accessToken = generateAccessToken(tokenUser);
    const refreshToken = jwt.sign(tokenUser, process.env.REFRESH_TOKEN_SECRET);

    //save refreshToken
    res.cookie('accessToken', accessToken);
    res.cookie('refreshToken', refreshToken);
    res.status(200).json({message:'logged in', username: user.username })

  } catch (err) {
    console.log(err);

    res.status(500).json({ message: err.message})
  }
})

router.post('/register', async (req, res) => {
  const hash = cryptoJs.SHA256(req.body.password).toString()

  const user = new User({
    username: req.body.username,
    password: hash
  })
  try {
    const newUser = await user.save()
    res.status(201).json(newUser)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
});

function generateAccessToken(data) {
  return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET)
}


module.exports = router
