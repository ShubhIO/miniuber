var mongoose=require("mongoose");
var bcrypt=require("bcryptjs");


// user schema
var UserSchema=mongoose.Schema({
  customer:{
    type:String,
    index:true
  },
  driver:{
    type:String
  },
  car:{
    type:String
  },
  carplate:{
    type:String
  },
  mobile:{
    type:String
  },
  duration:{
    type:String
  },
  destination:{
    type:String
  }
});

var Customer=mongoose.model("Customer",UserSchema);
module.exports=Customer;

module.exports.createUser=function(newUser,callback){
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
        newUser.password=hash;
        newUser.save(callback);
    });
});
};

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	Customer.findOne(query, callback);
}

module.exports.comparePassword=function(candidatePassword,hash,callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
   if(err) throw err;
   callback(null,isMatch);
});
};

module.exports.getUserById=function(id,callback){
  Customer.findById(id,callback);
};
