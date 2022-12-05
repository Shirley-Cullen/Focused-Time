const express = require('express'), 
    router = express.Router(),
    passport = require('passport'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    bcrypt = require('bcryptjs');

// const logout = require('express-passport-logout');
// const { deleteOne } = require('moongose/models/user_model');



router.get('/', (req, res) => {
  res.render('home');
});

router.get('/login', (req, res) => {
  res.render('login');
});



router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res) => {
  const {username, password} = req.body;
  User.findOne({username:username},function(err,user,count){
    console.log(!user);
    if (err){
      throw err;
    }
    if (!user){
      console.log('1');
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            // Store hash in your password DB.
            // pwd = hash;
            const newUser = new User({username:username,password:hash});
            newUser.save(function(err,usrs,count){
              console.log("saved!!!");
            });
        });
    });
    res.redirect('/user/login');
      
    }
    else{
      res.render('register',{message:"Invalid username!!!"});
    }
  });

  // User.register(new User({username}), req.body.password, (err, user) => {
  //   if (err) {
  //     res.render('register',{message:'Your registration information is not valid'});
  //   } else {
  //     passport.authenticate('local')(req, res, function() {
  //       res.redirect('/');
  //     });
  //   }
  // });   
});

// router.post('/login', passport.authenticate('local', {
//   successRedirect: '/group',
//   failureRedirect: '/user/login',
//   failureMessage: true
// }));




router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if(user) {
      req.logIn(user, (err) => {
        res.redirect('/user');
      });
    } else {
      res.render('login', {message:'Your login or password is incorrect.'});
    }

  })(req, res, next);
});

router.post('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

module.exports = router;