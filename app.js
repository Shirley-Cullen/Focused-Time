require('./db');
require('./auth.js');
const helper=require('./helper');


const express = require('express');
const path = require('path');
const publicPath = path.resolve(__dirname, "public");
const session = require('express-session');

const mongoose = require('mongoose');
const List = mongoose.model('List');
const Group = mongoose.model('Group');
const User = mongoose.model('User');
const passport = require('passport');

const app = express();
const sessionOptions = {
  secret: 'secret cookie thang (store this elsewhere!)',
  resave: true,
  saveUninitialized: true,
};
app.use(session(sessionOptions));

app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: false }));

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
const authRouter = require('./routes/user');
// const { UserExistsError } = require('passport-local-mongoose/lib/errors');
const listRouter = require('./routes/list');
// const { userInfo } = require('os');

app.set('view engine', 'hbs');



// enable sessions



// app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));

// // passport setup
app.use(passport.initialize());
app.use(passport.session());

// make user data available to all templates
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use('/user',authRouter);
app.use('/list',listRouter);


app.get('/',(req,res)=>{
  res.redirect('/user');
});

app.get('/group', (req, res) => {
  const filter={};

  if(req.query.hasOwnProperty('groupName') && req.query.groupName!==""){
      filter.groupID=req.query.groupName;
  }
  List.findOne({listID:'total'},function(err,l){
    const result = l.groups.filter((e)=>{
      if (e.includes(req.query.groupName)){
        return e;
      }
    });
    console.log(result);
    if (result.length ===0){
      Group.find({},function(err,groups){
        if (err){
            res.status(500).send("Wrong with the database connection!!!");
        }
        else{
            res.render('group',{groups:groups});
        }
        
    });


    }
    else{
      Group.find({groupID:{$in:result}},function(err,groups){
        if (err){
            res.status(500).send("Wrong with the database connection!!!");
        }
        else{
            res.render('group',{groups:groups});
        }
        
    });

    }
  });

});

app.post('/group', (req, res) => {
  if ((req.body.submit ==='Create')){
    const groupCreateTime = Object.create(helper.constructTime);

    // let date = '';
    // const time = new Date();
    // const month = time.getMonth()+1
    // date +=time.getFullYear()+"-"+month+'-'+time.getDate();
    const date = groupCreateTime.full();
    if (req.body.newName!==''){
      Group.findOne({groupID:req.body.newName},function(err,g1){
        if (err){
          res.status(500).send("Wrong with the database connection!!!");
        }
        if (g1){
          res.render('group',{message:"The Group has already EXISTED!!!🙁"});
        }
        else{
          const newGroup = new Group({
            groupID: req.body.newName,
            createdAt: date
          });
    
          newGroup.save(function(err,saved){
            if (err){
              throw err;
            }
            
          });
          List.findOne({listID:"total"},function(err,l){
            l.groups.push(req.body.newName);

            l.save(function(err,saved){
              if (err){
                throw err;
              }
              
            });
          });

          res.redirect('/group');

        }
      });
      

    }
  }
  else if((req.body.submit==='Join')){
    if (req.body.newName===''){
      res.redirect('/group');
    }
    else{
    Group.findOne({groupID:req.body.newName},function(err,g,count){
      if (!g){
        res.render('group',{message:"Please enter a correct group name!🤯"});
      }
      else if (g.member.includes(req.user.username)){
          res.render('group',{message:"You have already been this group!!!😵‍💫"});
        }
        else{
          User.findOne({username:req.user.username},function(err,u,count){
            if (err){
              res.render('error',{message:"Wrong with DB Connection!!!",error:err});
            }
            else if ((u.group!==undefined)&&(u.group!==null)){
              res.render('group',{message:"You have already joined a group!!!😵‍💫"});
            }
            else if((u.group===undefined) || (u.group===null)){
              u.group=g._id;
              g.member.push(req.user.username);
              g.save(function(err,saved){
                if (err){
                  res.render('error',{message:"Wrong with DB Connection!!!",error:err});
                }
                else{
                  console.log('saved new group member!!!',saved);
                }
                
              });
  
              u.save(function(err,saved){
                if (err){
                  throw err;
                }
                console.log("Save user's group info!!!");
              });
  
              res.render('group',{message:'Successfully JOIN!!!🤗'});
  
            }
            
          });
  
          
        
  
        }
      
      

    });

  }
    
  }
  else if((req.body.submit==='Leave Group')){

    User.findOne({username:req.user.username},function(err,u,count){
      if ((u.group===undefined) || (u.group===null)){
        res.render('group',{message:"You didn't join any group 😢"});
      }
      else{
        u.group=null;
        Group.findOne({_id:req.user.group},function(err,g,count){
          g.member.pull(req.user.username);
          g.save(function(err,saved){
            console.log('update group members!!!');
          });
        });

        u.save(function(err,saved){
          console.log("Update group info status!!!");
        });
        res.render('group',{message:"You have successfully leave a group 😬"});
      }
    });
  

  }

  else if(req.body.submit==='Back'){
    res.redirect('/group');
  }

});

app.get('/record',(req,res)=>{
  res.sendFile('/record.html');
});



// app.post('/logout', function(req, res){
//   req.logout();
//   res.redirect('/');
// });
// app.use('/', routes);
// app.use('/list', list);
// app.use('/list-item', listItem);



const port = process.env.PORT || 3000;
app.listen(port);