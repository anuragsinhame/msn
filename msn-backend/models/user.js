const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  // unique is not for storing unique values i.e. for validating input
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
});

// adding uniqueValidator plugin
// It adds an extra hook which will check the data before saving it to database
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);