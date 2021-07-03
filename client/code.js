const urlOpmlFile = "http://drummer.scripting.com/davewiner/states.opml";

function startup () {
	console.log ("startup");
	readHttpFile (urlOpmlFile, function (opmltext) {
		if (opmltext !== undefined) {
			var theOutline = opmlParse (opmltext);
			var htmltext = getOutlineHtml (theOutline);
			$("#idOutlineViewer").html (htmltext);
			
			var xmltext = opmlStringify (theOutline);
			xmltext = replaceAll (xmltext, "<", "&lt;");
			$("#idOpmlViewer").html (xmltext);
			
			//console.log (jsonStringify (theOutline));
			}
		});
	}
