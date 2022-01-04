# Markdown/outline demo app

This app illustrates the reading and writing of outlines from an extended version of Markdown that some outliners use to exchange user structures. 

### The name of the format

This format doesn't appear to have a name, so we're using the name <i>markdown/outline</i> in the docs and code. 

### What test.js does

There's an example file, states.md, in the folder with the app. It was produced in LogSeq, an outliner that uses this format. 

The app reads the file, then converts it to a JavaScript oijbect called theOutline, by calling opml.markdownToOutline, a routine provided by the OPML package. 

Then it writes the structure to two files: newStates.md and newStates.opml, by calling two routines provided by the OPML package. There are no differences in the data stored in these files, the two formats are exactly equivalent. 

### Where to discuss

A <a href="https://github.com/scripting/drummerRFC/issues/4#issuecomment-1004429268">thread</a>  on the DrummerRFC site where this work is being discussed.

