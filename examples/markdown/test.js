//1/4/22; 12:08:54 PM by DW

const fs = require ("fs");
const opml = require ("opml");

fs.readFile ("states.md", function (err, mdtext) {
	if (err) {
		console.log (err.message);
		}
	else {
		var theOutline = opml.markdownToOutline (mdtext.toString ());
		fs.writeFile ("newStates.opml", opml.stringify (theOutline), function (err) {
			if (err) {
				console.log ("There was an error writing states.md: " + err.message);
				}
			});
		fs.writeFile ("newStates.md", opml.outlineToMarkdown (theOutline), function (err) {
			if (err) {
				console.log ("There was an error writing states.md: " + err.message);
				}
			});
		console.log ("\nLook for newStates.md and newStates.opml in the same directory as test.js.\n");
		}
	});
