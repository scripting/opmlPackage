//Read and write an OPML file from a file.
	//Also display:
		//the outline's title from the head section and 
		//the text of the third child of the second top level subhead of the United States.
	//Illustrates how you read data from the compiled structure.
	//The point is, once you've compiled the OPML, you process it as if it were read by JSON.parse.
	//And when you're done, you serialize it with opml.stringify. 
	//By design, works exactly like JSON, so every JS programmer should find this familiar. 
	//7/3/21; 11:36:22 AM by DW

const fs = require ("fs");
//const utils = require ("daveutils");
const opml = require ("opml");

fs.readFile ("states.opml", function (err, opmltext) {
	if (err) {
		console.log (err.message);
		}
	else {
		opml.parse (opmltext, function (err, theOutline) { //convert OPML text into a JavaScript structure
			console.log ("\nThe outline's title is \"" + theOutline.opml.head.title + ".\""); //see comment at top
			console.log ("The third state in the Great Plains is: \"" + theOutline.opml.body.subs [0].subs [1].subs [2].text + ".\"");
			fs.writeFile ("states.json", JSON.stringify (theOutline, undefined, 4), function (err) {
				if (err) {
					console.log (err.message);
					}
				else {
					console.log ("states.json was saved.");
					}
				});
			fs.writeFile ("statescopy.opml", opml.stringify (theOutline), function (err) {
				if (err) {
					console.log (err.message);
					}
				else {
					console.log ("statescopy.opml was saved.");
					}
				});
			});
		}
	});

