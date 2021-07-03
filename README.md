# opmlPackage

Node and browser-based code that helps developers support OPML in outliners, processors and renderers.

### Using the Node package

To parse a local OPML file:

const fs = require ("fs");

const opml = require ("opml");

fs.readFile ("states.opml", function (err, opmltext) {

if (err) {

console.log (err.message);

}

else {

opml.parse (opmltext, function (err, theOutline) {

console.log (JSON.stringify (theOutline, undefined, 4));

});

}

});

