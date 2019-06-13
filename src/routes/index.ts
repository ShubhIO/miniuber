//import express from "express";
let exp = require('express');
//import * as ex from "express";
let rout = exp.Router();

rout.get("/",ensureAuthenticated,(req,res)=>{
  req.flash("role", res.locals.role);
  res.locals.username = res.locals.user.username;
  req.flash("username", res.locals.username);
  
  res.render('index');
});

// ....Middleware functionality...
// ....secure path to dashboard... 
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }else{
    //req.flash("error_msg","you are not logged in");
    res.redirect('/users/landingPage');
  }
};

module.exports=rout;
