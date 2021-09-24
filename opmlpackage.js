const myVersion = "0.4.10", myProductName = "opmlPackage"; 

exports.parse = parse; 
exports.stringify = stringify; 
exports.htmlify = getOutlineHtml; 
exports.visitAll = visitAll; 

const utils = require ("daveutils");
const opmltojs = require ("opmltojs");
const xml2js = require ("xml2js");
const opmlToJs = require ("opmltojs");

function parse (opmltext, callback) { //returns a JavaScript object with all the info in the opmltext
	//Changes
		//1/18/21; 10:21:27 AM by DW
			//I created an OPML format that added a "subs" attribute to each headline that had subs. This was an error, but was still valid OPML, but it caused this code to fail, because subs was the wrong type. It is always a mistake, if it's possible that your OPML will be converted to a JS object. So I protected against it here, and don't copy an attribute called subs if it's present. It's possible that this fix could cause problems too, btw. The code is in Old School, look for saveDayInOpml. 
		//4/18/20; 5:43:20 PM by DW
			//Changed the callback to return the standard format, with an err first, and theOutline second. 
			//I didn't want to break all the apps that use this as it was configured, but in the future, use this entry point not the one without the error.
	function isScalar (obj) {
		if (typeof (obj) == "object") {
			return (false);
			}
		return (true);
		}
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
	//xml2js.parseString (opmltext, options, function (err, jstruct) {
		//if (err) { //4/18/20 by DW
			//callback (err);
			//}
		//else {
			//var theOutline = {
				//opml: new Object ()
				//}
			//convert (jstruct.opml, theOutline.opml);
			//addGenerator (theOutline.opml); //8/6/17 by DW
			//if (isScalar (theOutline.opml.head)) { //8/6/17 by DW
				//theOutline.opml.head = new Object ();
				//}
			//if (isScalar (theOutline.opml.body)) { //8/6/17 by DW
				//theOutline.opml.body = new Object ();
				//}
			//callback (undefined, theOutline);
			//}
		//});
	}
function stringify (theOutline) { //returns the opmltext for the outline
	var opmltext = opmlToJs.opmlify (theOutline);
	return (opmltext);
	}
function getOutlineHtml (theOutline) {
	var htmltext = ""; indentlevel = 0;
	function add (s) {
		htmltext += filledString ("\t", indentlevel) + s + "\n";
		}
	function addSubsHtml (node) {
		add ("<ul>"); indentlevel++;
		node.subs.forEach (function (sub) {
			add ("<li>" + sub.text + "</li>");
			if (sub.subs !== undefined) {
				addSubsHtml (sub);
				}
			});
		add ("</ul>"); indentlevel--;
		}
	addSubsHtml (theOutline.opml.body);
	return (htmltext);
	}
function visitAll (theOutline, callback) {
	function visitSubs (theNode) {
		if (theNode.subs !== undefined) {
			for (var i = 0; i < theNode.subs.length; i++) {
				var theSub = theNode.subs [i];
				if (!callback (theSub)) {
					return (false);
					}
				visitSubs (theSub);
				}
			}
		return (true);
		}
	visitSubs (theOutline.opml.body);
	}
