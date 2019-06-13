import { setInterval } from "timers";

let expr= require('express');
let rou = expr.Router();
var Customer = require("./models/customer");
var User = require("./models/user");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//var User = require('../models/user');
var flash=require("connect-flash");
let redis= require("redis");
let Promise2 = require("bluebird");
let client = Promise2.promisifyAll(redis.createClient())
// ......register...get....
rou.get('/pastrides', (req, res) => {
  Customer.find({driver: res.locals.username},(err, docs) => {
      if (!err) {
        req.flash("role", "Driver");
          res.render("drivertable", {
              list: docs
          });
      }
      else {
          console.log('Error in retrieving employee list :' + err);
      }
  });
});


rou.get("/register",(req,res)=>{
    res.locals.role = 'Driver';
    
    req.flash("role", "Driver");
    
    res.render("register");
});

// .......login..get data......
rou.get("/login",(req,res)=>{
  res.locals.role = 'Driver';
 req.flash("role","Driver")
  res.render('login');
});
rou.post("/register", (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  var role = 'Driver';
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
    res.redirect("/Driver/login");
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
rou.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/Driver/dashboard",
    failureRedirect: "/Driver/login",
    failureFlash: true
  }),
  function(req, res) {
    res.redirect("/Driver/dashboard");
  }
);

// ......logout.......redirect.............
rou.get("/logout", function(req, res) {
  req.logout();

  req.flash("success_msg", "You are logged out");

  res.redirect("/Driver/login");
});

const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);

//et client1  = Promise2.promisifyAll(redis.createClient())
rou.post("/RideInformation",async (req,res)=>{
  
  var driver = ""+res.locals.user.username;
  var customer="";

  let result = await client.getAsync(driver); 
  //getAsync(driver)
  //.then((result)=> {
    console.log("redis accessed");
    if (result != null) {
      var str = result.split(" ");
      var traveltime = str[0];
      customer = str[1];  
      ///update the customer rides table.
     
      var newUser = new Customer({
        customer: customer,
        driver: driver,
        duration:"35",
        mobile:"8427733488",
        car:"swift dezire",
        carplate:"CH01BC2375",
        destination:"12th cross 6th main AECS"
        
      });
      console.log('driver is' + JSON.stringify(driver));
      console.log('customer is' + JSON.stringify(str[1]));
      console.log('travel time is' + JSON.stringify(str[0]));
      let stat = await newUser.save();
      res.sendStatus(200);
    }
    
})
// .then(()=>{
  
//     console.log("saved");
//     res.sendStatus(200);
    
// }).catch((err)=>{
//   console.error(err);
//   res.sendStatus(500);
  
// })
//console.log("left call");
 //req.flash("username", customer);
 
 //res.render("rideinformation"); 
 //res.redirect("/Driver/info");



module.exports = rou;