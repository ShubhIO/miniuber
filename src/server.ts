const express = require('express');
let Promise2 = require("bluebird");
var path = require('path');
var cookieParser=require("cookie-parser");
var bodyParser=require("body-parser");
var exphbs=require("express-handlebars");
var expressValidator=require("express-validator");
var flash=require("connect-flash");
const session = require('express-session');
var passport=require("passport");
var LocalStrategy=require("passport-local").Strategy;
var mongo=require("mongodb");
var cors=require("cors");
const config=require("./config/database");
var mongoose=require("mongoose");

let redis= require("redis");

let client  = Promise2.promisifyAll(redis.createClient())

client.on("error",function(err){
  console.log("Error " + err);
})



mongoose.connect(config.database,{ useNewUrlParser: true});


mongoose.connection.on('connected',()=>{
  
  console.log("Connected to Database"+ config.database);
});

mongoose.connection.on('error',(err)=>{
  console.log("DB Conncetion ERROR:"+err);
})



// io.on("connection",(socket)=>{
//   console.log("A user is connected")
// })


var routes=require("./routes/index");
var users=require("./routes/users");
var cust =require("./customers");
var driver = require("./drivers");

var app=express();
var http = require('http').createServer(app);
var io =require('socket.io')(http);
// view engine
app.set("views",path.join(__dirname,"views"));
const handlebarsHelpers = require('./helper');

app.engine('handlebars', exphbs({defaultLayout: 'layout',helpers: handlebarsHelpers}));
app.set('view engine', 'handlebars');

// body-parser middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors());

// set static folder
app.use(express.static(path.join(__dirname,"public")));

// express session
app.use(session({
  secret:'secret',
  saveUninitialized:true,
  resave:true
}));

// passpot initialize
app.use(passport.initialize());
app.use(passport.session());

// expressValidator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// connect flash
app.use(flash());

// global var
app.use(function(req,res,next){
  res.locals.success_msg=req.flash('success_msg');
  res.locals.error_msg=req.flash('error_msg');
  res.locals.error=req.flash('error');
  if(req.originalUrl.indexOf('Customer')>-1)
  { 
      res.locals.role = 'Customer'
  }
  if(req.originalUrl.indexOf('Driver')>-1)
  { 
      res.locals.role = 'Driver'
  }
        
  res.locals.user=req.user||null;
  res.locals.username = req.flash('username');
  next();
});


var userMap={};
io.on("connection", function (socket) {
  //console.log("user is connected");
  
  socket.on('TripEnded',(driver)=>{
    var str = driver.split(" ");
    var driv = str[0];
    var cust = str[1]; 
    console.log('TripEnded by driver '+ driver);
    client.del(driv);
    client.set(cust,"Ended");
    socket.emit("yesaccepted","100");
  })
  socket.on('TripStarted',(driver)=>{
    var str = driver.split(" ");
    var driv = str[0];
    var cust = str[1]; 
    console.log('TripStarted by driver '+ driver);
    client.set(driv,"Started " + cust);
    client.set(cust,"Started " + driv);
  })
  socket.on('NotifyCustomer',(driver)=>{
    var str = driver.split(" ");
    var driv = str[0];
    var cust = str[1]; 
    console.log('Waiting for customer '+ driver);
    client.set(driv,"Waiting " + cust);
    client.set(cust,"Waiting " + driv);
  })
  // socket.on('didanyaccept',()=>{
  //   //console.log('didanyaccept call');
  //   client.keys("driver*",(err,rows)=>{
  //     if(rows.length==0)
  //     {
  //      console.log("return to normal");
  //      socket.emit("yesaccepted");
  //     }
  //    });
   
  // })
  socket.on('CancelRequest',(driver)=>{
    console.log("Cancel request");
    client.del(driver);

  })
  socket.on('AcceptedRequest',(driver)=>{
      //console.log(driver + ' Accepted');
      let str = driver.split(" ");
      let dri= str[0];
      let cust = str[1];
      client.get(str[1]+str[0], function (error, result) {
          if (result != null) {
              var str = result.split(" ");
              var traveltime = str[0];
              var customer = str[1]; 
              
              
              client.keys("*"+dri,(err,rows)=>{
                  for(var i = 0, j = rows.length; i < j; ++i){
                      client.del(rows[i]);
                  }
              });
              client.keys(cust+"*",(err,rows)=>{
                for(var i = 0, j = rows.length; i < j; ++i){
                    client.del(rows[i]);
                }
                
            });
              //client.set(cust,"Accepted "+dri);
              client.set(cust,"Accepted "+dri);
              client.set(dri,"Accepted "+cust);
              console.log('Driver Accepted'+ driver);
              
          }
          
      });

  })

  socket.on('getcustomerstate', async function (customer) {
      
     let allcancel = await client.keysAsync(customer+"*");
     if(allcancel.length==0)
     {
      console.log("all cancelled");
      socket.emit("allcancelled","1");
      return;
     }  
      


      console.log(customer + ' customer pinged');
      client.get(customer, function (error, result) {
          if (result != null) {
            var str = result.split(" ");
            var traveltime = str[0];
            var driver = str[1]; 
            if(result.includes("Waiting")){
              console.log(customer + ' waiting');
              socket.emit("driverwaiting",driver+" "+"3");

            }else if(result.includes("Accepted")){
                           
              console.log(customer + ' accepted');
              //console.log('travel time is' + JSON.stringify(result));
              socket.emit("driverassigned",driver+" "+"2");
            }
            else if(result.includes("Started")){
                           
              console.log(customer + ' started');
              //console.log('travel time is' + JSON.stringify(result));
              socket.emit("tripstarted",driver+" "+"4");
            }
            else if(result.includes("Ended")){
                           
              console.log(customer + ' ended');
              //console.log('travel time is' + JSON.stringify(result));
              client.del(customer);
              socket.emit("tripended",driver+" "+"5");
            }

          }
      });
  });
//   socket.on('fordriversecond', function (driver) {
//     //console.log(driver + ' customer pinged');
//     client.get(driver, function (error, result) {
//         if (result != null) {
//            var str = result.split(" ");
//               var traveltime = str[0];
//               var customer = str[1]; 
//             if(result.includes("Accepted")){
              
//               console.log(driver + ' driver customerassigned');
//               //console.log('travel time is' + JSON.stringify(result));
//               socket.emit("customerassigned",customer);
//             }
//             else if(result.includes("Waiting")){
//               socket.emit("customerassignedtripnotify",customer);
//             }
//              else{ 
//                socket.emit("customerassignedtripstart",customer);
//             }
            
//         }
//     });
// });


  socket.on('getdriverstate', async function (driver) {
      console.log(driver + ' driver pinged');
      
      var driver_key = "*"+driver;
      
      let state = await client.getAsync(driver)//, function (error, result) {
      if (state != null) {
           let str = state.split(" ");
           let traveltime = str[0];
           let customer = str[1]; 
           if(state.includes("Accepted")){
              
              console.log(driver + ' driver customerassigned');
              //console.log('travel time is' + JSON.stringify(result));
              socket.emit("customerassigned",customer+" 3");
            }
            else if(state.includes("Waiting")){
              socket.emit("customerassignedtripnotify",customer+" 4");
            }
             else{ 
              socket.emit("customerassignedtripstart",customer+" 5");
            }
            return;
        }
      //check for new request in redis 
      let result = await client.keysAsync(driver_key)//, async function (error, result) {    c1d1 c2d1
          if (result.length!=0) {
            for(let i = 0, j = result.length; i < j; ++i){
              //client.del(result[i]);
              
                
            
                  
              console.log(driver_key + ' pinged and allotment begins');
               //console.log('travel time is' + JSON.stringify(result));
              
              let value = await client.getAsync(result[i]);
              //,function (error, result) {
              if (value != null) { 
                let str =value.split(" ");
                let traveltime = str[0];
                let customer = str[1]; 
                let status = str[2]; 
                  console.log(driver_key + ' pinged and allotment begins');
                  socket.emit("drivernewrequest",customer+" 2");
                  return;
              }
              
              
              
            }
         
          } else{//donot accept
            console.log("return to normal");
            socket.emit("yesaccepted","100");
          }
          
          
      })
              //client.set(driver_key,traveltime+" "+customer+" 1")
              
                   



            //  let str = result.split(" ");
            //  let traveltime = str[0];
            //  let customer = str[1]; 
            //  let status = str[2]; 
            //   console.log(driver_key + ' pinged and allotment begins');
            //   //console.log('travel time is' + JSON.stringify(result));
            //   if(status == '1'){
            //     client.set(driver_key,traveltime+" "+customer+" 2")

            //   }
            //   socket.emit("drivernewrequest",customer+" 2");
                          
          // }
//           else{
//             //check for current state like accepted, notify, start
//             client.get(driver, function (error, result) {
//               if (result != null) {
//                  var str = result.split(" ");
//                     var traveltime = str[0];
//                     var customer = str[1]; 
//                   if(result.includes("Accepted")){
                    
//                     console.log(driver + ' driver customerassigned');
//                     //console.log('travel time is' + JSON.stringify(result));
//                     socket.emit("customerassigned",customer+" 3");
//                   }
//                   else if(result.includes("Waiting")){
//                     socket.emit("customerassignedtripnotify",customer+" 4");
//                   }
//                    else{ 
//                      socket.emit("customerassignedtripstart",customer+" 5");
//                   }
                  
//               }
//               else{
//                 //check already accepted calls()
//                 client.keys("driver*",(err,rows)=>{
//                   if(rows.length==0)
//                   {
//                    console.log("return to normal");
//                    socket.emit("yesaccepted","ping");
//                   }
//                  });

//               }

//           });

//           }


//       });
//   });
 });

app.use("*/dashboard",routes);
app.use("*/users",users);
app.use("/Customer",cust);
app.use("/Driver",driver);

// set port
var port=process.env.PORT||3004;
http.listen(port,()=>{
  console.log(`app running on port ${port}`);
});
//require('./config/socketConfig.ts')(app, io);
