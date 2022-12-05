require('./db');
// console.log('auth!!!');
const mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = mongoose.model('User'),
    bcrypt = require('bcryptjs');

// passport.use(new LocalStrategy(User.authenticate()));
passport.use(new LocalStrategy(function verify(username, password, cb) {
    console.log('start!!!');
    User.findOne({username:username}, function(err, user, count) {
      if (err) { return cb(err); }
      if (!user) { 
        return cb(null, false, { message: 'Incorrect username or password.' }); 
      }
      else{ 
        //   const check = await bcrypt.compare(password,user.password);
        //   if (check){
        //       return cb(null,user);
        //   }
        //   else{
        //       return cb(null,false)
        //   }
        bcrypt.compare(password,user.password,(err,isMatch)=>{
          if(err){return cb(err);}
          if(isMatch){
            return cb(null,user);
          }
          else{
            return cb(null,false,{message: "Wrong Password!!!"});
          }
  
        });
      }
    });
  }));
// passport.serializeUser(User.serializeUser());
passport.serializeUser(function(user,done){
  done(null,user.username);
})
// passport.deserializeUser(User.deserializeUser());
passport.deserializeUser(function(username,done){
  User.findOne({username:username},function(err,u){
    done(err,u);
  });
})