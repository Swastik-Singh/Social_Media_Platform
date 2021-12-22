const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  userName: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const User = model('User', userSchema);

module.exports = User;