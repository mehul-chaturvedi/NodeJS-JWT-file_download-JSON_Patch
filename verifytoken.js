const jwt = require('jsonwebtoken');
const config = require('./config');

function verifyToken(req, res, next){
    console.log(req.headers['x-access-token'], 'req')
    var token = req.headers['x-access-token'];
  if (!token) 
    return res.status(403).send({ auth: false, message: 'No token provided.' });

        console.log(token, 'token')
        jwt.verify(token, config.secret, (err, decoded) => {
          if (err) {
            return res.json({
              success: false,
              message: 'Token is not valid'
            });
          } else {
              console.log(decoded)
             req.userId = decoded.id;
             next()
          }
        });
      
}
module.exports = verifyToken;