const mongoose = require('mongoose')

const plm = require('passport-local-mongoose')

var postSchema = mongoose.Schema({
  post: String,
  username: String,
  userid:{
      type: mongoose.Schema.Types.ObjectId, ref: "user"
  },
  comments:[{
    type: mongoose.Schema.Types.Mixed
  }],
  likes:[{
      type: mongoose.Schema.Types.ObjectId, ref: "user"
  }]
})

postSchema.plugin(plm);

module.exports = mongoose.model('post', postSchema);