const opml = {
	parse: opmlParse,
	stringify: opmlStringify,
	htmlify: getOutlineHtml,
	read: readOutline, //9/24/21 by DW
	visitAll: visitAll,
	markdownToOutline, //1/3/22 by DW
	outlineToMarkdown //1/3/22 by DW
	};

function filledString (ch, ct) { //6/4/14 by DW
	var s = "";
	for (var i = 0; i < ct; i++) {
		s += ch;
		}
	return (s);
	}
function encodeXml (s) { //7/15/14 by DW
	//Changes
		//12/14/15; 4:28:14 PM by DW
			//Check for undefined, return empty string.
	if (s === undefined) {
		return ("");
		}
	else {
		var charMap = {
			'<': '&lt;',
			'>': '&gt;',
			'&': '&amp;',
			'"': '&'+'quot;'
			};
		s = s.toString();
		s = s.replace(/\u00A0/g, " ");
		var escaped = s.replace(/[<>&"]/g, function(ch) {
			return charMap [ch];
			});
		return escaped;
		}
	}
function xmlCompile (xmltext) { //3/27/17 by DW
	return ($($.parseXML (xmltext)));
	}
function xmlGatherAttributes (adrx, theTable) {
	if (adrx.attributes != undefined) {
		for (var i = 0; i < adrx.attributes.length; i++) {
			var att = adrx.attributes [i];
			if (att.specified) {
				theTable [att.name] = att.value;
				}
			}
		}
	}
function xmlGetAttribute (adrx, name) {
	return ($(adrx).attr (name));
	}
function xmlGetAddress (adrx, name) {
	return (adrx.find (name));
	}
function xmlGetSubValues (adrx) { //10/12/16 by DW
	//Changes
		//10/12/16; 11:25:15 AM by DW
			//Return a JS object with the values of all the sub-elements of adrx.
	var values = new Object ();
	$(adrx).children ().each (function () {
		var name = xmlGetNodeNameProp (this);
		if (name.length > 0) {
			var val = $(this).prop ("textContent");
			//name = "opml" + string.upper (name [0]) + string.mid (name, 2, name.length - 1);
			values [name] = val;
			}
		});
	return (values);
	}
function xmlGetNodeNameProp (adrx) { //12/10/13 by DW
	return ($(adrx).prop ("nodeName"));
	}
function xmlHasSubs (adrx) {
	return ($(adrx).children ().length > 0); //use jQuery to get answer -- 12/30/13 by DW
	};

function outlineToJson (adrx, nameOutlineElement) { //12/25/20 by DW
	//Changes
		//10/20/14; 5:54:44 PM by DW
			//Convert a <source:outline> structure from an RSS item into a jstruct.
	var theOutline = new Object ();
	if (nameOutlineElement === undefined) {
		nameOutlineElement = "outline";
		}
	xmlGatherAttributes (adrx, theOutline);
	if (xmlHasSubs (adrx)) {
		theOutline.subs = [];
		$(adrx).children (nameOutlineElement).each (function () {
			theOutline.subs [theOutline.subs.length] = outlineToJson (this, nameOutlineElement);
			});
		}
	return (theOutline);
	}
function markdownToOutline (mdtext, options) {  //1/3/22 by DW
	//Changes
		//1/12/22; 5:17:25 PM by DW
			//New optional param, options. 
			//options.flAddUnderscores, defaults true. 
		//1/8/22; 10:54:14 AM by DW
			//Any atts that show up at the beginning of a file are ignored. Previously they would cause the process to crash.
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
	
	if (options === undefined) { //1/12/22 by DW
		options = new Object ();
		}
	if (options.flAddUnderscores === undefined) {
		options.flAddUnderscores = true;
		}
	
	mdtext = mdtext.toString ();
	var lines = mdtext.split ("\n"), lastlevel = 0, lastnode = undefined, currentsubs = theOutline.opml.body.subs, stack = new Array ();
	lines.forEach (function (theLine) {
		var thislevel = 0, flInsert = true;
		while (theLine.length > 0) {
			if (theLine [0] != "\t") {
				break;
				}
			thislevel++;
			theLine = stringDelete (theLine, 1, 1);
			}
		if (beginsWith (theLine, "- ")) {
			theLine = stringDelete (theLine, 1, 2);
			}
		else { //is the line an attribute?
			if (stringContains (theLine, ":: ")) {
				let parts = theLine.split (":: ");
				if (lastnode !== undefined) { //1/8/22 by DW
					var name = (options.flAddUnderscores) ? "_" + parts [0] : parts [0]; //1/12/22 by DW
					lastnode [name] = parts [1];
					//lastnode ["_" + parts [0]] = parts [1];
					}
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
function outlineToMarkdown (theOutline) {  //1/3/22 by DW
	//Changes
		//1/3/22; 6:03:00 PM by DW
			//Generate markdown text from the indicated outline structure 
			//that can be read by LogSeq and compatible apps. 
	var mdtext = "", indentlevel = 0;
	function add (s) {
		mdtext += filledString ("\t", indentlevel) + s + "\n";
		}
	function addAtts (atts) {
		for (var x in atts) {
			if ((x != "subs") && (x != "text")) {
				if (beginsWith (x, "_")) {
					add (stringDelete (x, 1, 1) + ":: " + atts [x]);
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

function opmlParse (opmltext) {
	//Changes
		//12/16/21; 11:43:21 AM by DW
			//If opmltext is not valid XML, display a message in the console.
		//6/13/21; 9:49:51 AM by DW
			//Generate a JavaScript object from OPML text. 
	var xstruct;
	try {
		xstruct = xmlCompile (opmltext);
		}
	catch (err) {
		console.log ("opmlParse: invalid XML.");
		throw err;
		}
	
	var adrhead = xmlGetAddress (xstruct, "head");
	var adrbody = xmlGetAddress (xstruct, "body");
	var theObject = {
		opml: {
			head: xmlGetSubValues (adrhead),
			body: outlineToJson (adrbody)
			}
		}
	return (theObject);
	}
function opmlStringify (theOutline) { //returns the opmltext for the outline -- 8/6/17 by DW
	var opmltext = "", indentlevel = 0;
	function add (s) {
		opmltext += filledString ("\t", indentlevel) + s + "\n";
		}
	function addSubs (subs) {
		if (subs !== undefined) {
			for (var i = 0; i < subs.length; i++) {
				let sub = subs [i], atts = "";
				for (var x in sub) {
					if (x != "subs") {
						atts += " " + x + "=\"" + encodeXml (sub [x]) + "\"";
						}
					}
				if (sub.subs === undefined) {
					add ("<outline" + atts + " />");
					}
				else {
					add ("<outline" + atts + " >"); indentlevel++;
					addSubs (sub.subs);
					add ("</outline>"); indentlevel--;
					}
				}
			}
		}
	add ("<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>");
	add ("<opml version=\"2.0\">"); indentlevel++;
	//do head section
		add ("<head>"); indentlevel++;
		for (var x in theOutline.opml.head) {
			add ("<" + x + ">" + theOutline.opml.head [x] + "</" + x + ">");
			}
		add ("</head>"); indentlevel--;
	//do body section
		add ("<body>"); indentlevel++;
		addSubs (theOutline.opml.body.subs);
		add ("</body>"); indentlevel--;
	add ("</opml>"); indentlevel--;
	//console.log ("opmlify: opmltext == \n" + opmltext);
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

function readOutline (urlOpmlFile, options, callback) { //9/24/21 by DW
	//Changes
		//9/27/21; 1:57:08 PM by DW
			//If options is not defined, initialize it to a default object.
		//9/24/21; 1:51:52 PM by DW
			//Read the outline over HTTP. If options.flSubscribe is present and true, we set up a websockets connection if the outline supports it, and calll back when it updates.
	var mySocket = undefined, urlSocketServer;
	function beginsWith (s, possibleBeginning, flUnicase) { 
		if (s === undefined) { //7/15/15 by DW
			return (false);
			}
		if (s.length == 0) { //1/1/14 by DW
			return (false);
			}
		if (flUnicase === undefined) {
			flUnicase = true;
			}
		if (flUnicase) {
			for (var i = 0; i < possibleBeginning.length; i++) {
				if (stringLower (s [i]) != stringLower (possibleBeginning [i])) {
					return (false);
					}
				}
			}
		else {
			for (var i = 0; i < possibleBeginning.length; i++) {
				if (s [i] != possibleBeginning [i]) {
					return (false);
					}
				}
			}
		return (true);
		}
	function readHttpFile (url, timeoutInMilliseconds, headers, callback) { 
		if (timeoutInMilliseconds === undefined) { 
			timeoutInMilliseconds = 5000;
			}
		if (headers === undefined) {
			headers = new Object ();
			}
		var jxhr = $.ajax ({ 
			url: url,
			dataType: "text", 
			headers: headers,
			timeout: timeoutInMilliseconds 
			}) 
		.success (function (data, status) { 
			callback (undefined, data);
			}) 
		.error (function (status) { 
			callback (status);
			});
		}
	function wsWatchForChange () { //connect with socket server, if not already connected
		if (mySocket === undefined) {
			mySocket = new WebSocket (urlSocketServer); 
			mySocket.onopen = function (evt) {
				var msg = "watch " + urlOpmlFile;
				mySocket.send (msg);
				console.log ("wsWatchForChange: socket is open. sent msg == " + msg);
				};
			mySocket.onmessage = function (evt) {
				var s = evt.data;
				if (s !== undefined) { //no error
					const updatekey = "update\r";
					if (beginsWith (s, updatekey)) { //it's an update
						var opmltext = stringDelete (s, 1, updatekey.length);
						console.log ("wsWatchForChange: update received along with " + opmltext.length + " chars of OPML text.");
						callback (undefined, opmlParse (opmltext));
						}
					}
				};
			mySocket.onclose = function (evt) {
				mySocket = undefined;
				};
			mySocket.onerror = function (evt) {
				console.log ("wsWatchForChange: socket for outline " + urlOpmlFile + " received an error.");
				};
			}
		}
	 
	if (options === undefined) { //9/27/21 by DW
		options = {
			flSubscribe: false
			};
		}
	
	readHttpFile (urlOpmlFile, undefined, undefined, function (err, opmltext) {
		if (err) {
			callback (err);
			}
		else {
			if (options.flSubscribe) {
				var theOutline = opmlParse (opmltext);
				urlSocketServer = theOutline.opml.head.urlUpdateSocket;
				wsWatchForChange (); //connect with socket server
				self.setInterval (wsWatchForChange, 1000); //make sure we stay connected
				callback (undefined, theOutline);
				}
			else {
				callback (undefined, opmlParse (opmltext));
				}
			}
		});
	}
