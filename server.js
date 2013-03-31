var	words = require("./static/js/wordstuff"),
	express = require('express'),
	app = express(),
	PORT = 3000,
	http = require('http');

var server = http.createServer(app);
var io = require('socket.io').listen(server);

words.setupWords(); 
var userCount = 0;


// Use Express to serve the static files 

app.configure(function() {
    app.set('port', PORT);
    app.use(express.logger('dev'));
    app.use(express.static(__dirname + '/static'));
    app.use(app.router);
});

server.listen(app.get('port'));
/*server.listen(app.get('port'), function() {
    console.log("Express server listening on " + app.get('port'));
});*/
/* 
	socket.io abstracts away all the nasty bits, leaving just a few lines 
   of actual work */



io.enable('browser client minification');
io.enable('browser client etag');          
io.enable('browser client gzip'); 
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




