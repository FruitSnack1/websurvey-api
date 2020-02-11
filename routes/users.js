
// function getUser(id) {
//   MongoClient.connect(url, async (err, client) => {
//     if (err) return console.log('Unable to connect to the Server', err);
//     const db = client.db("quiz");
//     const user = await db.collection(`users`).find({
//       '_id': mongodb.ObjectId(id)
//     });
//     return user;
//   });
// }

// function authenticateToken(req, res, next) {
//   const token = req.cookies['accessToken'];
//   if (token == null) return res.sendStatus(401)

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     console.log(err)
//     if (err) return res.sendStatus(403)
//     req.user = user
//     next()
//   })
// }



const express = require('express')
const router = express.Router()
const crypto = require('crypto');
const jwt = require('jsonwebtoken')

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
    const hash = crypto.createHash('md5').update(req.body.password).digest('hex')
    if (hash != user.password)
      res.send('wrong password')

    const tokenUser = { 'id': user._id, 'username': user.username };
    const accessToken = generateAccessToken(tokenUser);
    const refreshToken = jwt.sign(tokenUser, process.env.REFRESH_TOKEN_SECRET);

    //save refreshToken
    res.cookie('accessToken', accessToken);
    res.cookie('refreshToken', refreshToken);
    res.status(200).json({message:'logged in'})

  } catch (err) {
    console.log(err);

    res.status(500).json({ message: err.message })
  }
})

router.post('/register', async (req, res) => {
  const hash = crypto.createHash('md5').update(req.body.password).digest('hex');

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
