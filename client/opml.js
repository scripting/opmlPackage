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
