//5/11/22; 4:59:24 PM by DW
	//Read an OPML file that has includes.
	//Pass it through opml.expandIncludes.
	//Display the resulting outline, with the includes expanded. 

const fs = require ("fs");
const opml = require ("opml");

fs.readFile ("includes.opml", function (err, opmltext) {
	if (err) {
		console.log (err.message);
		}
	else {
		opml.parse (opmltext, function (err, theOutline) { //convert OPML text into a JavaScript structure
			opml.expandIncludes (theOutline, function (theNewOutline) {
				console.log (JSON.stringify (theNewOutline, undefined, 4));
				});
			});
		}
	});
