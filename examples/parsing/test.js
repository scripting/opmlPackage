//7/3/21; 3:27:01 PM by DW
	//Read and write an OPML file from a file.
	//Also display:
		//The outline's title from the head section and 
		//The text of the third child of the second top level subhead of the United States.
		//Illustrates how you get data from the compiled structure.
		//Once you've compiled the OPML, you process it as a JavaScript object.
		//When you're done, you can serialize it with opml.stringify. 
		//By design, works like JSON, so every JS programmer should find this familiar. 
	//Visit every node in the outline, and convert the text to upper case.
		//Display OPML text of the uppercased outline in the console.

const fs = require ("fs");
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
			opml.visitAll (theOutline, function (node) {
				node.text = node.text.toUpperCase ();
				return (true); //keep visiting
				});
			console.log (opml.stringify (theOutline)); //view the uppercased outline in the JS console
			});
		}
	});
