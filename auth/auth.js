import jwt from 'jsonwebtoken'

authenticateToken = (req, res, next) =>{
  const token = req.cookies['accessToken'];
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

generateAccessToken = (data) =>{
  return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET)
}

module.exports = {
  authenticateToken,
  generateAccessToken
};