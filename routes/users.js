const mongoose = require('mongoose')

const plm = require('passport-local-mongoose')

mongoose.connect('mongodb://localhost/port')

var userSchema = mongoose.Schema({
  name: String,
  username: String,
  profilepic:{
    type:String,
    default:"defuser.png",
  },
  password: String,
  posts: [{
    type: mongoose.Schema.Types.ObjectId, ref: "post"
  }]
})

userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema);
