# opmlPackage

Node and browser code that reads and writes OPML.

### The Node package

It's on NPM, it's called OPML.

Here's a snippet that reads an OPML file, converts it to a JavaScript object, displays it to the console via JSON.stringify.

```javascriptfs.readFile ("states.opml", function (err, opmltext) {	if (!err) {		opml.parse (opmltext, function (err, theOutline) {			if (!err) {				console.log (JSON.stringify (theOutline, undefined, 4));				}			});		}	});```

The full Node example is <a href="https://github.com/scripting/opmlPackage/tree/main/examples/parsing">here</a>. 

### OPML in the browser

The same routines are available for JavaScript code running in the browser. 

See the <a href="https://github.com/scripting/opmlPackage/tree/main/client">example</a>. You have to include <a href="https://github.com/scripting/opmlPackage/blob/main/client/opml.js">opml.js</a> in your app, as the example does. 

