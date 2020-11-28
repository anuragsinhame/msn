
// adding encryption module to encrypt password
const bcrypt = require('bcrypt');
// importing JWT
const jwt = require('jsonwebtoken');

// adding user model
const User = require('../models/user');

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash
    });
  user.save()
  .then(result => {
    res.status(201).json({
      message: 'User Created!',
      result
    });
  })
  .catch( (err) => {
    console.log('Connection Failed');
    res.status(500).json({
      message: 'Invalid Credentials'
    });
  });
  });
}

exports.login = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
  .then(user => {
    if(!user){
      return res.status(401).json({
        message: 'Invalid Credentials'
      });
    }
    // copying user data to another variable to access it later in next 'then'
    fetchedUser = user;
    // compare the encrypted password with the entered one
    return bcrypt.compare(req.body.password, user.password);
  })
  // we will pass the 'result' of the compare operation to another then
  .then(result => {
    // if the 'result' is not true i.e. incorrect creds
    if(!result){
      return res.status(401).json({
        message: 'Invalid Credentials'
      });
    }
    // if creds are correct,create JWT - JSON Web Token
    const token = jwt.sign(
      {email: fetchedUser.email, userId: fetchedUser._id},
      process.env.JWT_KEY,
      {expiresIn: '1h'}
      );
    res.status(200).json({
      token,
      expiresIn: 3600,   //expires in 3600 sec
      userId: fetchedUser._id,
      email: fetchedUser.email
    });
  })
  // any other error
  .catch(err => {
    return res.status(401).json({
      message: 'You are not authenticated'
    });
  })
}