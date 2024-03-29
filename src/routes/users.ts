let expre= require("express");
let route = expre.Router();

var User = require("../models/user");
var Customer = require("../models/customer");
var Driver = require("../models/driver");

// ......register...get....
route.get("/register", (req, res) => {
  //req.flash("success_msg", "You are registered and can now login");
  res.render("register");
});
route.get("/landingPage", (req, res) => {
  res.render("LandingPage");
});


// .......login..get data......
route.get("/login", (req, res) => {
  req.flash("role", res.locals.role);
  res.render("login");
});

// ....registration..posting data to DB.........
/*
route.post("/register", (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  var role = res.locals.role;
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
    res.redirect("/users/login");
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
route.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true
  }),
  function(req, res) {
    res.redirect("/");
  }
);

// ......logout.......redirect.............
route.get("/logout", function(req, res) {
  req.logout();

  req.flash("success_msg", "You are logged out");

  res.redirect("/users/login");
});
*/
module.exports = route;
