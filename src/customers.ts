let expres= require('express');
let router = expres.Router();
var SortedMap = require('sorted-map');
//import {DistanceController} from './controller/DistanceController';
import { RSA_NO_PADDING } from 'constants';
var User = require("./models/user");
var Customer = require("./models/customer");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
//var User = require('../models/user');
var flash=require("connect-flash");
//var io = require('socket.io')(http)
var redisClient = require('redis').createClient();
// ......register...get....
router.get("/register",(req,res)=>{
    res.locals.role = 'Customer';
    req.flash("role", "Customer");
    
    res.render("register");
});

// .......login..get data......
router.get('/pastrides', (req, res) => {
  Customer.find({customer: res.locals.username},(err, docs) => {
      if (!err) {
        req.flash("role", "Customer")
          res.render("rideinformation", {
              list: docs
          });
      }
      else {
          console.log('Error in retrieving employee list :' + err);
      }
  });
});

router.get("/login",(req,res)=>{
  res.locals.role = 'Customer';
  req.flash("role", "Customer")
  res.render('login');
 // res.redirect('customer/users/login')
});
router.post("/register", (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  var role = 'Customer';
  req.checkBody("name", "name is required").notEmpty();
  req.checkBody("email", "email is required").notEmpty();
  req.checkBody("email", "email is not valid").isEmail();
  req.checkBody("username", "username is required").notEmpty();
  req.checkBody("password", "password is required").notEmpty();
  req.checkBody("password2", "passwords donot match").equals(req.body.password);

  var errors = req.validationErrors();
  if (errors) {
    res.render("register", {
      errors: errors
    });
  } else {
   
      var newUser = new User({
        name: name,
        email: email,
        username: username,
        password: password,
        role: role
      });
      User.createUser(newUser, function(err, user) {
        if (err) throw err;
        console.log(user);
      });
    
    req.flash("success_msg", "You are registered and can now login");
    res.redirect("/customer/login");
  }
});

// .........passport..LocalStrategy.....authentication.....username....password....
passport.use(
  new LocalStrategy(function(username, password, done) {
    User.getUserByUsername(username, function(err, user) {
      if (err) throw err;
      if (!user) {
        return done(null, false, { message: "Unknown User" });
      }

      User.comparePassword(password, user.password, function(err, isMatch) {
        if (err) throw err;
        if (isMatch) {

          return done(null, user);
        } else {
          return done(null, false, { message: "Invalid password" });
        }
      });
    });
  })
);

// ...serailizer...deserializeUser.....
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

// .....login....passport authenticate...
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/Customer/dashboard",
    failureRedirect: "/Customer/login",
    failureFlash: true
  }),
  function(req, res) {
    res.redirect("/Customer/dashboard");
  }
);



// ......logout.......redirect.............
router.get("/logout", function(req, res) {
  req.logout();

  req.flash("success_msg", "You are logged out");

  res.redirect("/Customer/login");
});
let distance = require('google-distance');
let Set = require("sorted-set");
router.post("/book",async function(req,res){

   var username = res.locals.username;
   let mode = 'driving';
   var mapdistance = new Map();
   var set = new Set();
   var maptime= new Map();
   let source = `13.007064,77.688895`;
   let origin =[];
   let destination =[];
   distance.apiKey = 'AIzaSyCglq0Kms8522RFz1DdeJUljlN5qHIKWsY';
   let user = await User.find({role:'Driver'})//.then((user)=>{
   if(user.length!=0){

      for(let i =0,j=user.length;i<j;i++){
        destination.push(source);
        origin.push(`${user[i].latitude}, ${user[i].longitude}`);
        distance.get({ origin :origin,destination:destination},(err,result)=>{
          if (err) return console.log(err);
          if(result.length!=0){
            let mintime1=Number.MAX_VALUE;
            
            let mintime2=Number.MAX_VALUE;
            
            
           // let user1=maptime.get(mintime1);
            //let user2=maptime.get(mintime2);
            //let mindist1 = mapdistance.get(user1);
            //let mindist2 = mapdistance.get(user2);
            
            redisClient.set(res.locals.user.username+user[i],result.distanceValue+" "+res.locals.user.username+" 1"+" "+result.durationValue);
           // redisClient.set(res.locals.user.username+user2,mindist2+" "+res.locals.user.username+" 1"+" "+mintime2);
         }
        });
        

      }
     // destination.push(source);
      //origin.push(`${user.latitude}, ${user.longitude}`);
      //distance.apiKey = 'AIzaSyCglq0Kms8522RFz1DdeJUljlN5qHIKWsY';
      

   } 
   
   
    
    // let username = user.forEach(element =>{
    //   var i=20
    //   map.set(element.username,i);
    //   i=i+1;
    // })
    
    
  //   for(var i=0;i<user.length;i++){
  //     let j=20+i;
  //     map.set(user[i].username,20+j);
  //   }
  //   var info= map.get(user[0].username) + " " + res.locals.user.username+" 1";
  //   //redisClient.set(res.locals.user.username+" "+user[0].username,info);
     redisClient.set(res.locals.user.username+"rohit","35"+" "+res.locals.user.username+" 1");
     redisClient.set(res.locals.user.username+"rohit2","40"+" "+res.locals.user.username+" 1");
     redisClient.set(res.locals.user.username+"rohit3","40"+" "+res.locals.user.username+" 1");
  //   //redisClient.set("robin"+"rohit","35"+" "+res.locals.user.username+" 1");
  //   //res.sendStatus(200);

  
  //  }).catch((err)=>{
  //      res.sendStatus(500);
  //      console.error(err);
  //  })
   
   
   
   
   //const destination = `${req.body.destination[0]}, ${req.body.destination[1]}`;
  


  });

//13.007064, 77.688895
//13.025196, 77.825962

module.exports = router;