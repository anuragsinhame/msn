// Middleware is a function, so a function will be exported
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // we can get the token from url as well, but here we will get from header
  // authorization and bearer are the generally used words
  // example = "Bearer hiashc9hnogf90" ==> "Bearer token"
  try{
    // keep the new header in lower case
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'this_is_the_secret_key');
    // Adding a new field to reques, so that we can access the decoded token data in other modules
    req.userData = {
      // below are the fields, which were used to create the token => in userAuth.js
      email: decodedToken.email,
      userId: decodedToken.userId
    };
    next();
  }catch(error){
    res.status(401).json({ message: 'Auth Failed' });
  }
}
