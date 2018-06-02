const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/auth-demo');

const userSchema = mongoose.Schema({
  username: String,
  password: String
});

module.exports = mongoose.model('User', userSchema);
