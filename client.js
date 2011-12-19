/*
	FridgeNode is basically a digital knock of magnetic poetry.  It uses socket.io and node.js
	jQuery is used for the UI. Spin.js is used for the load spinner.
	See github.com/hlatki/FridgeNode for more details 
*/
var socket;
var wordTimes = new Array();

//get the words and their current positions
function SetupWords(jsonString) {
	var wordArr = jQuery.parseJSON(jsonString);

		var words = [];
		var i=0;
		var l=wordArr.length;
		for(i=0; i<l;i++) {
			words.push('<li class="ui-draggable" id="' + wordArr[i].ind + '" style="left:' + wordArr[i].posLeft+'; top: ' +  wordArr[i].posTop+';">' +  wordArr[i].wordstring + '</li>');
			wordTimes[wordArr[i].ind] = null;
	}

		$('<ul/>', {
			'id': 'board',
			html: words.join('')
			}).appendTo('body');
}


$(document).ready(function() {     
	socket = io.connect();
	//position the words
	socket.emit('get positions');
	socket.on('get positions',function(posStr) {
		SetupWords(posStr);
		// $( function() {
		$("li").draggable({ 
			containment: 'parent',
			cursor: 'move',
			stack: ".ui-draggable",

			start: function(event,ui) {
				var wordID = $(this).attr("id");
				socket.emit('start move',wordID); 
			},

			drag: function(event,ui) {
				var stopAt = $(this).position();
				var wordID = $(this).attr("id");
				socket.emit('in drag',wordID,stopAt.left,stopAt.top);
			},

			//get new position and send it on
			stop: function(event,ui) {
				var stopAt = $(this).position();
				var wordID = $(this).attr("id");
				socket.emit('move word',wordID,stopAt.left,stopAt.top);
			}
		});
		// });
	});
	

	//don't let other users drag the word while this is
	//in progress
	socket.on('start move', function(wordId) {
		var idstr = '#'+wordId;
		wordTimes[wordId] = new Date().getTime();

		if ( !$(idstr).hasClass("ui-draggable-dragging")) {
			$(idstr).draggable('disable');
			$(idstr).css({"background-color":"#CCC","color":"#999","border":"1px solid 666"});
		}
	});

	//when someone else  has moved a word, reposition this one 
	socket.on('move word', function(wordId,nwLeft,nwTop) {
		var idstr = '#'+wordId;
		$(idstr).draggable('enable');
		$(idstr).css({"background-color":"white","color":"black","border":"1px solid black"});
		$(idstr).css({"left": nwLeft, "top":nwTop});
	});


	socket.on('in drag', function(wordId,nwLeft,nwTop) {
		var idstr = '#'+wordId;
		if ( !$(idstr).hasClass("ui-draggable-dragging")) {
			$(idstr).css({"left": nwLeft, "top":nwTop});
		}
	});

	socket.on('get count', function(userCount) {
	if (userCount > 1) {
		var msg = userCount + " users connected";	
	} else {
		var msg = "1 user connected";
	}
			$("#numUsers").text(msg);
	});

	var t = setInterval(function() {
		var now = new Date().getTime();

		for (var m in wordTimes) {
			var idstr = '#'+m;
			var diff = new Date().setTime(now - wordTimes[m]);
			if ( ($(idstr).hasClass("ui-draggable-disabled")) && (wordTimes[m] != null) ) {
				var diff = new Date().setTime(now - wordTimes[m]);
				if (diff > 5000) {
					$(idstr).draggable('enable');
					wordTimes[m] = null;
				}
			} 
		}
	}, 10000); 

});
