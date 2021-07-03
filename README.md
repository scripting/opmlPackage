# opmlPackage

Node and browser code that reads and writes OPML.

### The node package

It's on NPM, it's called OPML.

Here's a snippet that reads an OPML file, converts it to a JavaScript object, displays it to the console via JSON.stringify.

```javascriptfs.readFile ("states.opml", function (err, opmltext) {	if (err) {		console.log (err.message);		}	else {		opml.parse (opmltext, function (err, theOutline) { //convert OPML text into a JavaScript structure			console.log ("\nThe outline's title is \"" + theOutline.opml.head.title + ".\""); //see comment at top			console.log ("The third state in the Great Plains is: \"" + theOutline.opml.body.subs [0].subs [1].subs [2].text + ".\"");			fs.writeFile ("states.json", JSON.stringify (theOutline, undefined, 4), function (err) {				if (err) {					console.log (err.message);					}				else {					console.log ("states.json was saved.");					}				});			fs.writeFile ("statescopy.opml", opml.stringify (theOutline), function (err) {				if (err) {					console.log (err.message);					}				else {					console.log ("statescopy.opml was saved.");					}				});			opml.visitAll (theOutline, function (node) {				node.text = node.text.toUpperCase ();				return (true); //keep visiting				});			console.log (opml.stringify (theOutline)); //view the uppercased outline in the JS console			});		}	});```

