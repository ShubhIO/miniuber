var mongoose=require("mongoose");
var bcrypt=require("bcryptjs");


// user schema
var UserSchema=mongoose.Schema({
  username:{
    type:String,
    index:true
  },
  password:{
    type:String
  },
  email:{
    type:String
  },
  name:{
    type:String
  },
  role:{
    type:String
  },
  Car:{
    type:String
  },
  location:{
    type: String
  }
});

var Driver=mongoose.model("Driver",UserSchema);
module.exports=Driver;

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
	Driver.findOne(query, callback);
}

module.exports.comparePassword=function(candidatePassword,hash,callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
   if(err) throw err;
   callback(null,isMatch);
});
};

module.exports.getUserById=function(id,callback){
    Driver.findById(id,callback);
};
