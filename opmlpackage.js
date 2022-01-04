const myVersion = "0.4.17", myProductName = "opmlPackage"; 

exports.parse = parse; 
exports.stringify = stringify; 
exports.htmlify = getOutlineHtml; 
exports.markdownToOutline = markdownToOutline; //1/3/22 by DW
exports.outlineToMarkdown = outlineToMarkdown; //1/3/22 by DW
exports.expandInclude = expandInclude; //1/4/22 by DW

const utils = require ("daveutils");
const opmltojs = require ("opmltojs");
const xml2js = require ("xml2js");
const request = require ("request");

function parse (opmltext, callback) { //returns a JavaScript object with all the info in the opmltext
	//Changes
		//12/27/21; 10:06:12 AM by DW
			//Under some circumstances, xml2js.parseString will return a result of null. It shows up in Daytona's log. So we check for it, and if it comes up, return an error. 
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
			if (jstruct == null) { //12/27/21 by DW
				let err = {message: "Internal error: xml2js.parseString returned null."};
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

function markdownToOutline (mdtext) { //1/3/22 by DW
	//Changes
		//1/3/22; 5:50:36 PM by DW
			//Turn a markdown file as created by LogSeq or a compatible product 
			//into an outline structure compatible with the one that is created from 
			//parsing OPML text.
	var theOutline = {
		opml: {
			head: {
				},
			body: {
				subs: new Array ()
				}
			}
		};
	mdtext = mdtext.toString ();
	var lines = mdtext.split ("\n"), lastlevel = 0, lastnode = undefined, currentsubs = theOutline.opml.body.subs, stack = new Array ();
	lines.forEach (function (theLine) {
		var thislevel = 0, flInsert = true;
		while (theLine.length > 0) {
			if (theLine [0] != "\t") {
				break;
				}
			thislevel++;
			theLine = utils.stringDelete (theLine, 1, 1);
			}
		if (utils.beginsWith (theLine, "- ")) {
			theLine = utils.stringDelete (theLine, 1, 2);
			}
		else { //is the line an attribute?
			if (utils.stringContains (theLine, ":: ")) {
				let parts = theLine.split (":: ");
				lastnode ["_" + parts [0]] = parts [1];
				flInsert = false;
				}
			}
		if (thislevel > lastlevel) {
			stack.push (currentsubs);
			lastnode.subs = new Array ();
			currentsubs = lastnode.subs;
			}
		else {
			if (thislevel < lastlevel) {
				var ctpops = lastlevel - thislevel;
				for (var i = 1; i <= ctpops; i++) {
					currentsubs = stack.pop ();
					}
				}
			}
		
		if (flInsert) {
			var newnode = {
				text: theLine
				}
			currentsubs.push (newnode);
			lastnode = newnode;
			lastlevel = thislevel;
			}
		});
	return (theOutline);
	}
function outlineToMarkdown (theOutline) { //1/3/22 by DW
	//Changes
		//1/3/22; 6:03:00 PM by DW
			//Generate markdown text from the indicated outline structure 
			//that can be read by LogSeq and compatible apps. 
	var mdtext = "", indentlevel = 0;
	function add (s) {
		mdtext += utils.filledString ("\t", indentlevel) + s + "\n";
		}
	function addAtts (atts) {
		for (var x in atts) {
			if ((x != "subs") && (x != "text")) {
				if (utils.beginsWith (x, "_")) {
					add (utils.stringDelete (x, 1, 1) + ":: " + atts [x]);
					}
				}
			}
		}
	function dolevel (theNode) {
		theNode.subs.forEach (function (sub) {
			add ("- " + sub.text);
			addAtts (sub);
			if (sub.subs !== undefined) {
				indentlevel++;
				dolevel (sub);
				indentlevel--;
				}
			});
		}
	//addAtts (theOutline.opml.head);
	dolevel (theOutline.opml.body)
	return (mdtext);
	}

function httpRequest (url, callback) {
	request (url, function (err, response, data) {
		if (err) {
			callback (err);
			}
		else {
			var code = response.statusCode;
			if ((code < 200) || (code > 299)) {
				const message = "The request returned a status code of " + response.statusCode + ".";
				callback ({message});
				}
			else {
				callback (undefined, data) 
				}
			}
		});
	}
function expandInclude (theNode, callback) {//1/4/22 by DW
	if ((theNode.type == "include") && (theNode.url !== undefined)) {
		httpRequest (theNode.url, function (err, opmltext) {
			if (err) {
				callback (err);
				}
			else {
				opml.parse (opmltext, function (err, theOutline) {
					if (err) {
						callback (err);
						}
					else {
						callback (undefined, theOutline.opml.body);
						}
					});
				}
			})
		}
	else {
		callback (undefined, theNode);
		}
	}
