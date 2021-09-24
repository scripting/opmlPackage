const opml = {
	parse: opmlParse,
	stringify: opmlStringify,
	htmlify: getOutlineHtml,
	read: readOutline, //9/24/21 by DW
	visitAll: visitAll
	};

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

function opmlParse (opmltext) {
	//Changes
		//6/13/21; 9:49:51 AM by DW
			//Generate a JavaScript object from OPML text. 
	var xstruct = xmlCompile (opmltext);
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
		//9/24/21; 1:51:52 PM by DW
			//Read the outline over HTTP. If options.flSubscribe is present and true, we set up a websockets connection if the outline supports it, and calll back when it updates.
	var mySocket = undefined, urlSocketServer;
	function readHttpFile (url, timeoutInMilliseconds, headers, callback) { 
		//Changes
			//7/17/15; 10:43:16 AM by DW
				//New optional param, headers.
			//12/14/14; 5:38:18 PM by DW
				//Add optional timeoutInMilliseconds param.
			//5/29/14; 11:13:28 AM by DW
				//On error, call the callback with an undefined parameter.
			//5/27/14; 8:31:21 AM by DW
				//Simple asynchronous file read over http.
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
