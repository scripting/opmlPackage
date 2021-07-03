//7/3/21; 3:27:01 PM by DW
	//Read an OPML file over the web, parse it into a JavaScript object.
		//1. Display the JSON text for the object in the first box.
		//2. Convert the JavaScript object to OPML text, and display that in the second box.
		//3. Generate an HTML rendering of the JavaScript object and display in third box.
	//Also display, in the JavaScript console:
		//The outline's title from the head section and 
		//The text of the third child of the second top level subhead of the United States.
		//Illustrates how you get data from the compiled structure.
		//Once you've compiled the OPML, you process it as a JavaScript object.
		//When you're done, you can serialize it with opml.stringify. 
		//By design, works like JSON, so every JS programmer should find this familiar. 
	//Visit every node in the outline, and convert the text to upper case.
const urlOpmlFile = "http://drummer.scripting.com/davewiner/states.opml";

function startup () {
	console.log ("startup");
	readHttpFile (urlOpmlFile, function (opmltext) {
		if (opmltext !== undefined) {
			var theOutline = opml.parse (opmltext);
			
			var jsontext = JSON.stringify (theOutline, undefined, 4);
			$("#idJsonViewer").text (jsontext);
			
			var xmltext = opml.stringify (theOutline);
			$("#idOpmlViewer").text (xmltext);
			
			var htmltext = opml.htmlify (theOutline);
			$("#idOutlineViewer").html (htmltext);
			
			console.log ("\nThe outline's title is \"" + theOutline.opml.head.title + ".\""); //see comment at top
			console.log ("The third state in the Great Plains is: \"" + theOutline.opml.body.subs [0].subs [1].subs [2].text + ".\"");
			
			opml.visitAll (theOutline, function (node) {
				node.text = node.text.toUpperCase ();
				return (true); //keep visiting
				});
			console.log (opml.stringify (theOutline)); //view the uppercased outline in the JS console
			}
		});
	}
