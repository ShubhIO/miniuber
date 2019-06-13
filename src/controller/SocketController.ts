var socketusers = {}; //Map: id -> name of the user

exports.connected = function(socket,data){
    
    socketusers[socket.id]=data.name;

}

exports.disconnected = function(socket) {
    //Delete the user from the map.
    delete users[socket.id];
   
}

exports.sendmessage = function(socket, data) {
    socket.to(data.id).emit('newmessage', {
        message: data.message,
        name: socketusers[socket.id]
    });
}