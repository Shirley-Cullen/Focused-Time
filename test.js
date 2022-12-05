require('./db');
// const {a,b}={'a':1,'b':1};
// console.log(a);
// const date = new Date();
// console.log(typeof(date.getDate()));

const bcrypt = require('bcryptjs');
const passport = require('passport');
const express = require('express');
const path = require('path');
const publicPath = path.resolve(__dirname, "public");
const session = require('express-session');

const mongoose = require('mongoose');
const { UserExistsError } = require('passport-local-mongoose/lib/errors');
const Info = mongoose.model('Info');
const Group = mongoose.model('Group');
const List = mongoose.model('List');
const User = mongoose.model('User');

const app = express();
const sessionOptions = { 
	secret: 'secret for signing session id', 
	saveUninitialized: false, 
	resave: false 
};

app.use(session(sessionOptions));
app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: false }));

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

User.findOne({username:"mx648"},function(err,user,count){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash('123456', salt, function(err, hash) {
            // Store hash in your password DB.
            user.password = hash;
            user.save(function(err,saved,count){
                console.log(saved);
            });
        });
    });
})