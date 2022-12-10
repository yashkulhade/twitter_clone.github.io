var express = require('express');
var router = express.Router();
const userModel = require('./users')
const postModel = require('./post')
const passport = require('passport')
const passportLocal = require('passport-local');
const post = require('./post');
const multer = require('multer');

passport.use(new passportLocal(userModel.authenticate()))

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads');
  },
  filename: function (req, file, cb) {
    const uniq=Date.now()+Math.floor(Math.random()*100000)+file.originalname;
    cb(null, uniq);
  }
})

const upload = multer({ storage: storage })

function fileFilter (req, file, cb) {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null, true)
  } else {
    // cb(null, false)
    cb(new Error('I don\'t have a clue!'))
  }
}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.post('/register', function(req, res){
  var newUser = new userModel({
    name: req.body.name,
    username: req.body.username
  })
  userModel.register(newUser, req.body.password)
  .then(function(){
    passport.authenticate('local')(req, res, function(){
      res.redirect('/profile')
    })
  })
})

router.get("/profile", isLoggedIn, function(req, res){
  userModel.findOne({username: req.session.passport.user}).then((data)=>{
    data.populate('posts').then((all)=>{
      res.render('profile',{data, all:all.posts});
    })
  })
})

router.post('/login', passport.authenticate('local',{
  successRedirect: '/profile',
  failureRedirect: '/'
}),
function(req, res){});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/')
})

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next()
  }
  else {
    res.redirect('/');
  }
}

router.get("/update/:username", function(req, res){
  userModel.findOne({username: req.params.username})
  .then(function(Dets){
    res.render("update", {Dets})
  })
})

router.post("/update/:username", function(req, res){
  userModel.findOneAndUpdate({username: req.params.username}, {name: req.body.name})
  .then(function(){
    res.redirect("/profile")
  })
})

router.get("/read", function(req, res){
  userModel.find()
  .then(function(alldata){
    res.render("alluser", {alldata})
  })
})

router.post("/post", isLoggedIn, function(req, res){
  userModel.findOne({username: req.session.passport.user})
  .then(function(found){
    postModel.create({
      post: req.body.post,
      postid: found._id
    })
    .then(function(saved){
      found.posts.push(saved._id);
      found.save()
      .then(function(){
        res.redirect("/profile")
      })
    })
  })
})

router.get("/like/:id", isLoggedIn, function(req, res){
  userModel.findOne({username: req.session.passport.user})
  .then(function(foundUser){
    postModel.findOne({
      _id: req.params.id
    })
    .then(function(foundPost){
      if(foundPost.likes.indexOf(foundUser._id) === -1){
        foundPost.likes.push(foundUser._id);
      }else{
        var exist = foundPost.likes.indexOf(foundUser._id);
        foundPost.likes.splice(exist, 1);
      }
      foundPost.save()
      .then(function(){
        res.redirect('/profile')
      })
    })
  })
})

router.get('/feed', isLoggedIn, function(req, res){
    postModel.find()
  .then(function(sarepost){
    res.render('feed', {sarepost})
  }) 
})

router.post('/comment/:id', isLoggedIn, function(req, res){
  userModel.findOne({username: req.session.passport.user})
  .then(function(foundUser){
    postModel.findOne({_id: req.params.id})
    .then(function(wopost){
      // console.log("wopost",wopost);
      wopost.comments.push({comment: req.body.comment})
      wopost.save()
      .then(function(){
        res.redirect('/profile')
      })
    })
  })
})

router.post('/upload', isLoggedIn, upload.single('image'), function(req, res){
  userModel.findOne({username: req.session.passport.user})
  .then(function(foundUser){
      foundUser.profilepic = req.file.filename
      foundUser.save()
      .then(function(){
        res.redirect('/profile')
      })
    })
})

module.exports = router;
