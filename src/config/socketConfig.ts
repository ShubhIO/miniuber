var ctr = require('../controller/SocketController');
module.exports = function(app,io){

 
    io.on('connect', function(socket) {
    	ctr.connected(socket);
    	socket.on('disconnect', function() {
    		ctr.disconnected(socket);
    	});
    	socket.on('message', function(data) {
            ctr.sendmessage(socket, data);
        })
    });


};