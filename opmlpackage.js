const myVersion = "0.4.1", myProductName = "opmlPackage"; 

exports.parse = parse; 

const utils = require ("daveutils");
const opmltojs = require ("opmltojs");
const xml2js = require ("xml2js");

function isScalar (obj) {
	if (typeof (obj) == "object") {
		return (false);
		}
	return (true);
	}
function parse (opmltext, callback) {
	function addGenerator (theOpml) { //follow the example of RSS 2.0
		try {
			theOpml.head.generator = myProductName + " v" + myVersion;
			}
		catch (err) {
			}
		}
	function convert (sourcestruct, deststruct) {
		var atts = sourcestruct ["$"];
		if (atts !== undefined) {
			for (var x in atts) {
				if (x != "subs") { //1/18/21 by DW
					deststruct [x] = atts [x];
					}
				}
			delete sourcestruct ["$"];
			}
		for (var x in sourcestruct) {
			var obj = sourcestruct [x];
			if (isScalar (obj)) {
				deststruct [x] = obj;
				}
			else {
				if (x == "outline") {
					if (deststruct.subs === undefined) {
						deststruct.subs = new Array ();
						}
					if (Array.isArray (obj)) {
						for (var i = 0; i < obj.length; i++) {
							var newobj = new Object ();
							convert (obj [i], newobj);
							deststruct.subs.push (newobj);
							}
						}
					else {
						var newobj = new Object ();
						convert (obj, newobj);
						deststruct.subs.push (newobj);
						}
					}
				else {
					deststruct [x] = new Object ();
					convert (obj, deststruct [x]);
					}
				}
			}
		}
	var options = {
		explicitArray: false
		};
	xml2js.parseString (opmltext, options, function (err, jstruct) {
		if (err) { 
			callback (err);
			}
		else {
			var theOutline = {
				opml: new Object ()
				}
			convert (jstruct.opml, theOutline.opml);
			addGenerator (theOutline.opml); //8/6/17 by DW
			if (isScalar (theOutline.opml.head)) { //8/6/17 by DW
				theOutline.opml.head = new Object ();
				}
			if (isScalar (theOutline.opml.body)) { //8/6/17 by DW
				theOutline.opml.body = new Object ();
				}
			callback (undefined, theOutline);
			}
		});
	}
