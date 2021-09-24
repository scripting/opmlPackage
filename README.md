# opml package

A developer's toolkit for OPML support. Node and browser-based JavaScript code that reads and writes OPML.

#### What is OPML and why should we use it?

OPML is an XML-based format designed to store and exchange outlines with attributes. 

It's been around since the <a href="http://scripting.com/davenet/2000/09/24/opml10.html">early 2000s</a>, and is widely used in the RSS world to exchange subscription lists. 

It's also a standard for interop among outliners. If you support OPML, our products will interop, and our users will be able to use all our products on their data. 

#### Why this package?

I wanted to make it really easy for developers to add basic OPML support to their apps.

So I put the basic code you need to read and write OPML files, code that's debugged, used in other apps, including my own. It's known to work, to respect the format, and be easy to deploy.

There are other ways to read OPML, and that's very good. The more support there is, the more interop and that's the goal. I'm going to accumulate links to resources for OPML developers. If you have something you think they could use, send me an email at the address in the package.json file above. 

I recorded a <a href="http://scripting.com/2021/07/04/myPitchForOpml.m4a">podcast</a> explaining all this. :-)

#### What's in this package?

JavaScript code to parse and stringify OPML.

* opml.parse -- turns OPML text into a JavaScript structure representing the OPML.

* opml.stringify -- takes the JavaScript structure and turns it into OPML text.

* opml.htmlify -- a simple routine to display outlines in HTML.

* opml.visitAll -- a routine that visits all the nodes in an outline.

#### The Node package

It's on <a href="https://www.npmjs.com/package/opml">NPM</a>, it's called OPML.

Here's a snippet that reads an OPML file, converts it to a JavaScript object, displays it to the console via JSON.stringify.

```javascriptconst fs = require ("fs");const opml = require ("opml");fs.readFile ("states.opml", function (err, opmltext) {	if (!err) {		opml.parse (opmltext, function (err, theOutline) {			if (!err) {				console.log (JSON.stringify (theOutline, undefined, 4));				}			});		}	});```

The full Node example is <a href="https://github.com/scripting/opmlPackage/blob/main/examples/parsing/test.js">here</a>. 

#### OPML in the browser

The same routines are available for JavaScript code running in the browser. 

See the <a href="https://github.com/scripting/opmlPackage/tree/main/client">example</a>. You have to include <a href="e/blob/main/client/opml.js">opml.js</a> in your app, as the example does. 

You can <a href="http://scripting.com/code/opmlpackage/examples/browser/">run the example</a> right now, without downloading the repo.

The <a href="https://github.com/scripting/opmlPackage/tree/main/examples/browser">example app</a> includes the Bootstrap Toolkit, the Ubuntu font and jQuery. The OPML parsing and generating code does not depend on the first two, they're just used in the example app. opml.js uses jQuery, but otherwise should be completely self-contained, i.e. it does not depend on any other files.

#### Other OPML projects

I have a few OPML-related projects on GitHub and on the web. 

* <a href="https://github.com/scripting/instantOutlines">instantOutlines</a> -- Example code for sharing live-updated outlines between users, using websockets as the notification system.

* <a href="http://this.how/opmlChecklist/">OPML Developer checklist</a>. Examples, source code and advice for people adapting outliners to read and write OPML.

* <a href="http://dev.opml.org/spec2.html">OPML 2.0 spec</a>.

* Drummer -- Browser and Electron-based outliner that uses OPML as its native format. Coming soon, but not released as of July 2021.

* etc.

#### Updates

#### v0.4.10 -- 9/24/21 by DW

New entry-point in the <a href="https://github.com/scripting/opmlPackage/blob/main/client/opml.js">client</a>, opml.read. 

Reads an OPML file, returns a JavaScript object with the outline head and structure.

If options.flSubscribe is true, we ask to be notified when the file changes over a websocket. 

We call back to the same routine we called when the file was read, assuming it will do the same thing with the updated OPML.

#### Questions, comments?

If you have any questions or comments please post an issue <a href="https://github.com/scripting/opmlPackage/issues">here</a>. 

