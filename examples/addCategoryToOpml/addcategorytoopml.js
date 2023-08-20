var myProductName = "addcategorytoopml", myVersion = "0.4.0";

const fs = require ("fs");
const utils = require ("daveutils");
const opml = require ("opml");

const fsource = "wpspecialprojects.opml";
const theCategory = "all,wp-projects";
const fdest = "/users/davewiner/dropbox/portableDave/publicFolder/a8c/subscriptionLists/wpspecialprojects.opml";



function notComment (item) { //8/21/22 by DW
	return (!utils.getBoolean (item.isComment));
	}

fs.readFile (fsource, function (err, opmltext) {
	if (err) {
		console.log (err.message);
		}
	else {
		opml.parse (opmltext, function (err, theOutline) {
			if (err) {
				console.log (err.message);
				}
			else {
				opml.visitAll (theOutline, function (node) {
					if (notComment (node)) {
						if (node.type == "rss") {
							if (node.xmlUrl !== undefined) {
								node.category = theCategory;
								}
							}
						}
					return (true); //keep visiting
					});
				const opmltext = opml.stringify (theOutline);
				console.log (opmltext);
				fs.writeFile (fdest, opmltext, function (err) {
					if (err) {
						console.log (err.message);
						}
					});
				}
			});
		}
	});
