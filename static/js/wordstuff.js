/* 
	wordstuff.js:
	defines and initializes the word list
	as well as the getters and setters for positions
*/
function FridgeWord(ind,wordstring,posLeft,posTop) {
	this.ind = ind;
	this.wordstring = wordstring;
	this.posLeft = posLeft;
	this.posTop = posTop;
}

var FridgeWordList = new Array;

function setupWords() {
var rawWordList = 	["monkey","eats","banana","you","word","again","the","the","the","the","is","is","is","was","was",
				"village","shoot","the","a","noun","verb","s","ed","he","has","has","kick","need","see","live","corner",
				"rotate","elevate","retire","am","a","a","a","one","one","it","adverb","when","several","jump","y","y","er","est","was",
				"fake","chuck","shout","comic","sans","many","were","ed",
				"she","it","they","his","her","and","but","may", "be", "all","door","talk","hello","goodbye","says","run",
				"end","leave","s","wave","s","er","fast","octopodes","in","sun","above","below",
				"sea","shell","fancy","car",
				"umbrella","rain","will","dune","yellow","est","red"];

/*  Get some values */
function randVals(min,max) {
	var val = min + Math.floor(Math.random() * (max-min+1));
	return val;
}
var i = 0;
var l = rawWordList.length;
for (i=0; i<l; i++) {
	var x = randVals(22,750);
	var y = randVals(32,560);
	FridgeWordList.push(new FridgeWord(i,rawWordList[i],x,y));
}
}

/* uses JSON to return all the words
 and their positions and indices */
function getAllWords() {
	var jsonwords = JSON.stringify(FridgeWordList);
	return jsonwords;
}

//set the position of the word
function setWordPos(ind,leftMov,topMov) {
	FridgeWordList[ind].posLeft = leftMov;
	FridgeWordList[ind].posTop = topMov;
}

exports.setupWords = setupWords;
exports.setWordPos = setWordPos;
exports.getAllWords = getAllWords;
