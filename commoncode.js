function markdownToOutline (mdtext) { //returns a JS object compiled from a Markdown outline
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
function outlineToMarkdown (theOutline) {
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
