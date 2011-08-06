/* be a high tech poet 
 the wordstuff file has all the functions that deal with the words 
This is just a really primitive experiment with node.js and socket.io,
so the code is not the best
 */



var http = require('http'),
	fs = require('fs'),
	url = require('url'),
	path = require('path'),
	words = require("./wordstuff"),
	sio = require('socket.io');


words.setupWords(); 
var userCount = 0;

/* very basic server to get the few files we need */
var server = http.createServer(function (request, response) {
	var fileReq = url.parse(request.url).pathname;
	var filename = "";

	if (fileReq === '/') {
		filename = './index.html';
	} else {
		filename = '.' + fileReq;
	}
	
	/* very limited mechanism for determining content type */
	var contType = "";
	switch(path.extname(filename)) {
		case '.css':
			contType="text/css";
			break;
		case '.js':
			contType="text/javascript";
			break;
		default:
			contType="text/html";

	}
	
	fs.readFile(filename, function(err, file) {  
    	if(err) {  
    		response.writeHead(400, { 'Content-Type': 'text/plain' });  
        	response.end("Oh noes!");  
        	return;
    	 }  
     	 response.writeHead(200, { 'Content-Type': contType });  
         response.end(file, "utf-8");  
     });
});

server.listen(8008);

/* 
	socket.io abstracts away all the nasty bits, leaving just a few lines 
   of actual work */
var io  = sio.listen(server);


/* socket.io config details */
io.enable('browser client minification');
io.set('log level',2);
io.set('transports', [
	'websocket',
	'flashsocket',
	'htmlfile',
	'xhr-polling',
	'jsonp-polling'
]);

io.sockets.on('connection', function(socket) {
	

	userCount++;

	console.log("User connected" + "(" + userCount + " users connected)" );
	//provide current positions
	socket.on('get positions', function() {
		var wordData = words.getAllWords();
		socket.emit('get positions', wordData);
		io.sockets.emit('get count', userCount);
		
	});



   	//start the move--gray out every one else's stuff
   	socket.on('start move', function(wordId) {
    	  socket.broadcast.emit('start move',wordId);
	});
   
    //change the word's position and broadcase it to everyone
    socket.on('move word', function(wordId,leftVal,topVal) {
    	words.setWordPos(wordId,leftVal,topVal);
    	socket.broadcast.emit('move word',wordId,leftVal,topVal);
    });

    socket.on('in drag', function(wordId,leftVal,topVal) {
    	socket.broadcast.emit('in drag',wordId,leftVal,topVal);
    });




	socket.on('disconnect', function () {
		userCount--;
		console.log("User disconnected" + "(" + userCount + " users connected)" );
		socket.broadcast.emit('get count', userCount);
	});



});
