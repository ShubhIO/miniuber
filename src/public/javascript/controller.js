var socket = io();

var users = {};
var timeoutcust,timeoutdrive,timeoutdrive2;
var checkinterval;
var acceptflag=0;
var custname;
var currentstate=0;

//reload page
socket.on('allcancelled',function(driver){
    //let str = driver.split(" ");
    //let data = str[0];
    //let state = str[1]; 
    if(currentstate==0||currentstate < driver){  
      currentstate = driver;
      //alert("Sorry we could not find a cab for you.Try again after sometime");
      var x = document.getElementById("Book");
      x.style.visibility="visible";
      //currentstate=0;
    }
});
socket.on('yesaccepted',function(driver){
    //let str = driver.split(" ");
    //let data = str[0];
    //let state = str[1]; 
    document.location.reload();
    if(currentstate==0||currentstate < driver){
      currentstate = driver;
      document.location.reload();
    }

});
socket.on('tripstarted', function(driver){
    let str = driver.split(" ");
    let data = str[0];
    let state = str[1]; 
    if(currentstate==0||currentstate < state){
        currentstate = state;
      var messagesBlock = $('#message');
	//   var x = document.getElementById("Book");
    //   x.style.visibility="hidden";
      var x = document.getElementById("Book");
      if(x!=null){
        $("#Book").remove();   
      // x.style.visibility="hidden";
      }
      x = document.getElementById("wait");
      if(x!=null){
        $("#wait").remove();   
      // x.style.visibility="hidden";
      }
      var message = $('<p>Enjoy your ride with Driver '+data+'</p>');

      messagesBlock.append(message);
     alert("Trip started");
    }
})


socket.on('tripended', function(driver){
    let str = driver.split(" ");
    let data = str[0];
    let state = str[1]; 
    if(currentstate==0||currentstate < state){
       currentstate = state;
       alert("Trip ended");
       document.location.reload();
    }
})


//for customer waiting
socket.on('driverwaiting', function(driver) {
    //clearInterval(timeoutcust)
    let str = driver.split(" ");
    let data = str[0];
    let state = str[1]; 
    if(currentstate==0||currentstate < state){
      currentstate = state;
      alert("Driver "+data+" is waiting")
      var messagesBlock = $('#message');
	  var x = document.getElementById("Book");
      $("#Book").remove();   
      x = document.getElementById("assign");
      if(x!=null)
      $("#assign").remove();  
      //x.style.visibility="hidden";
      var message = $('<div id="wait" ><p>Your Driver '+data+' has reached at your location.</p><p>Please meet your Driver ASAP!!</p><div>');

      messagesBlock.append(message);
    }

});
//for customer notified
socket.on('driverassigned', function(driver) {
    //clearInterval(timeoutcust)
    let str = driver.split(" ");
    let data = str[0];
    let state = str[1]; 
    if(currentstate==0||currentstate < state){
      currentstate = state;
      alert("Driver has been notified")
      var messagesBlock = $('#message');
	  var x = document.getElementById("Book");
      $("#Book").remove();   
      //x.style.visibility="hidden";
      var message = $('<div id="assign"><p>Your Booking is successful</p><br><p>Your cab is on the way</p><br><p>Your todays driver is '+ data + '.'+'</p>');

      messagesBlock.append(message);
   }
});
//for driver assigned
socket.on('customerassigned', function(driver) {
    //document.location.reload();
    
    let str = driver.split(" ");
    let data = str[0];
    let state = str[1]; 
    if(currentstate==0||currentstate < state){
     currentstate = state;
     if(data!=null)
      custname=data;
     //clearInterval(timeoutdrive2);
      alert("Customer has been notified");
      let messagesBlock = $('#message');
      
      x = document.getElementById("requestmsg");
      if(x!=null)
      {
        $("#requestmsg").remove();   
         // x.style.visibility="hidden";
      }
      var message = $('<div id ="bookmsg"><p>Your Booking is successful</p><br><p>Your customer is waiting</p><br><a href="https://www.google.com/maps/search/?api=1&query=28.6139,77.2090"target="_blank" id="ride"  class="btn btn-primary btn-lg btn-block">Navigate to Customer</a><div>');
    
      x = document.getElementById("notify");

      x.style.visibility="visible";

      messagesBlock.append(message);
  }
})
//for driver notifying
socket.on('customerassignedtripnotify', function(driver) {
    //document.location.reload();
    let str = driver.split(" ");
    let data = str[0];
    custname = data;
    let state = str[1]; 
    if(currentstate==0||currentstate < state){
        currentstate = state;
     if(data!=null)
      custname=data;
     //clearInterval(timeoutdrive2);
     alert("Customer is notified");
     let messagesBlock = $('#message');
     let x = document.getElementById("bookmsg");
     if(x!=null)
     {
        $("#bookmsg").remove();    
        //x.style.visibility="hidden";
    
    }var message = $('<div id="waiting"><p>Please wait for customer for 5 mins</p><br><a href="https://www.google.com/maps/search/?api=1&query=28.6139,77.2090"target="_blank" id="ride"  class="btn btn-primary btn-lg btn-block">Navigate to Customer</a></div>');
     x = document.getElementById("notify");
     x.style.visibility="hidden";
     x = document.getElementById("start");
     x.style.visibility="visible";
       
    
     messagesBlock.append(message);
    }
})
//for driver starting trip
socket.on('customerassignedtripstart', function(driver) {
    //document.location.reload();
    let str = driver.split(" ");
    let data = str[0];
    let state = str[1]; 
    if(currentstate==0||currentstate < state){
        currentstate = state;
     if(data!=null)
      custname=data;
    // clearInterval(timeoutdrive2);
     alert("Trip is started");
     let messagesBlock = $('#message');
    
     var message = $('<p>Your trip has started</p><br><p>Your customer is '+ data+ '</p><a href="https://www.google.com/maps/search/?api=1&query=28.6139,77.2090"target="_blank" id="ride"  class="btn btn-primary btn-lg btn-block">Navigate to Destination</a>');
     let x = document.getElementById("start");
     x.style.visibility="hidden";
     x = document.getElementById("waiting");
     if(x!=null)
     x.style.visibility="hidden";
     x = document.getElementById("end");
     x.style.visibility="visible";
     x = document.getElementById("bookmsg");
     if(x!=null)
     {
        $("#bookmsg").remove();    
         //x.style.visibility="hidden";
    }
     messagesBlock.append(message);
    }
})
//for driver recieving requests(New request)
socket.on('drivernewrequest', function(driver) {
    
    let str = driver.split(" ");
    let data = str[0];
    let state = str[1]; 

    if(currentstate==0||currentstate < state){
        currentstate = state;
     if(data!=null)
      custname=data;
    // clearInterval(timeoutdrive)
     alert("Request has been made")
     var messagesBlock = $('#message');
	
     var message = $('<div id ="requestmsg"><p >You have recieved a new Request from '+ data +'. <br>Would you like to accept?</p><button id="Accept" onClick="onClickAccept()" class="btn btn-primary btn-lg btn-block">Accept</button><button id="Cancel" onClick="onClickCancel()" class="btn btn-primary btn-lg btn-block">Cancel</button></div>');

     messagesBlock.append(message);
    //  checkinterval=setInterval(function socketfunction(){
    //      var username = document.getElementById("username").innerHTML.substring(8);
    //      console.log(username);
    //      socket.emit('didanyaccept',username.toString());
        
    //  },5000)
    }

});
socket.on('Alertbooking', function(data) {
	alert("You have recieved a new request");
});

async function  onClickCancel(){
    var username = document.getElementById("username").innerHTML.substring(8);
    //clearInterval(checkinterval);   
    let result = await socket.emit('CancelRequest',custname+username.toString(),);
   
    document.location.reload();
}

//on driver clicking accept booking
function onClickAccept(){
    var username = document.getElementById("username").innerHTML.substring(8);
    //clearInterval(checkinterval);   
    

    console.log("accept clicked");
    socket.emit('AcceptedRequest',username.toString()+" "+custname);
    $.post('/Driver/RideInformation',()=>{
        acceptflag =1;
        
    });
    
}
//on customer clicking book
function onClickBook(){
    
        let x = document.getElementById("Book");
        $("#Book").remove();    
        //x.style.visibility="hidden";
        alert("Your booking has started");
    $.post('/Customer/book',()=>{
        
        
    });
    
}
//on driver clicking notify
function onClickNotify(){
    let x = document.getElementById("notify");
    x.style.visibility="hidden";
    x = document.getElementById("start");
    x.style.visibility="visible";
    x = document.getElementById("bookmsg");
    $("#bookmsg").remove();    
    //x.style.visibility="hidden";
    let username = document.getElementById("username").innerHTML.substring(8);
    socket.emit('NotifyCustomer',username.toString()+" "+custname);
    
}
//on driver clicking start trip
function onClickStart(){
    let x = document.getElementById("start");
    x.style.visibility="hidden";
    x = document.getElementById("end");
    x.style.visibility="visible";
    let username = document.getElementById("username").innerHTML.substring(8);
    socket.emit('TripStarted',username.toString()+" "+custname);
   
    
}
//on driver clicking end trip
function onClickEnd(){
    let x = document.getElementById("end");
    x.style.visibility="hidden";
    let username = document.getElementById("username").innerHTML.substring(8);
    socket.emit('TripEnded',username.toString()+" "+custname);
    
}

//driver event (check for initial driver selection)
timeoutdrive=setInterval(function socketfunction(){
        let username = document.getElementById("username").innerHTML.substring(8);
        let role = document.getElementById("role").innerHTML.substring(13);
        console.log(username);
        if(role=='Driver')
         socket.emit('getdriverstate',username.toString());
        else
         clearInterval(timeoutdrive);
       
},5000)
//driver event (check for driver entry in redis)
// timeoutdrive2=setInterval(function socketfunction(){
//     let username = document.getElementById("username").innerHTML.substring(8);
//     let role = document.getElementById("role").innerHTML.substring(13);
//     console.log(username);
//     if(role=='Driver')
//      socket.emit('fordriversecond',username.toString());
//     else
//      clearInterval(timeoutdrive);
   
// },5000)

    

//customer event (check for customer entry in redis)
timeoutcust=setInterval(function socketfunction(){
        let username = document.getElementById("username").innerHTML.substring(8);
        let role = document.getElementById("role").innerHTML.substring(13);
        console.log(username);
        if(role == 'Customer' )
         socket.emit('getcustomerstate',username.toString());
        else
          clearInterval(timeoutcust);

},5000)

