#### 9/7/24; 9:59:57 AM by DW

visitAll in both client and server versions had a serious bug. 

if a function returns false it's supposed to stop visiting, but it doesn't. 

perhaps i've never encountered a situation where the logic depended on this. 

i have to fix it, i don't see any way around it. 

#### 5/25/24; 3:47:32 PM by DW

Fixed another problem in getOutlineHtml. We were calling filledString and really needed to call utils.filledString.

#### 5/24/24; 8:12:30 AM by DW

Fixed a problem <a href="https://github.com/scripting/opmlPackage/issues/12">reported</a> on GitHub where we were declaring htmltext and indentlevel incorrectly. 

* `var htmltext = ""; indentlevel = 0;`

Replaced the first semicolon with a comma. 

The problem appeared in two places, in the Node package and in the code to be included with a client app.

#### 8/20/23; 10:31:38 AM by DW

Changed the generator message on OPML files we generate to include the address of the NPM package.

Changed the private notes file to this file, worknotes.md. The format changed, so some of the earlier notes might not be as pretty as they were. This is becoming standard practice in all my projects.

#### 1/8/22; 10:57:35 AM by DW

I undid the changes made on the 7th. 

I had decided earlier to not try to handle head-level atts in the first attempt at interop. There are too many variables, and I don't understand enough of the issues. It's the proverbial can of worms.

#### 1/7/22; 1:43:05 PM by DW

Support for head-level atts when reading a markdown file.

#### 1/4/22; 5:40:31 PM by DW

Added example code for markdown/outline functions.

Added expandInclude in Node package. 

#### 1/3/22; 5:52:48 PM by DW

Added commoncode.js because some code can run equally well on server and client. 

#### 9/24/21; 2:18:33 PM by DW

New entry-point in client code, opml.read. 

Started an Updates section in the readme. 

#### 7/1/21; 11:45:06 AM by DW

opml.parse has to take a callback because xml2js.parse does.

#### 6/28/21; 3:25:22 PM by DW

this is where the toolkit for supporting instant outlines and other stuff will go

may incorporate features from other packages

the idea is to make it easy for Node devs to support OPML in an interoperable way

