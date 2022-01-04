* <a name="a0"></a>Markdown as an outline format <a href="#a0">#</a>
   * <a name="a1"></a>We use a format we're calling markdown/outline, the format used by a number of outliners, in the same way we use OPML <a href="#a1">#</a>
* <a name="a2"></a>What test.js does <a href="#a2">#</a>
   * <a name="a3"></a>It starts with a .md file that came from LogSeq.  <a href="#a3">#</a>
      * <a name="a4"></a>It's the states outline we use for testing Drummer, but in Markdown. <a href="#a4">#</a>
      * <a name="a5"></a>Several states have a capital attribute.  <a href="#a5">#</a>
   * <a name="a6"></a>We first read the states.md file and convert it into a JavaScript object called theOutline.  <a href="#a6">#</a>
      * <a name="a7"></a>This is a standard structure, it's the way we represent outlines internally. <a href="#a7">#</a>
   * <a name="a8"></a>Then we write the structure into a "newfiles" sub-directory, two files: <a href="#a8">#</a>
      * <a name="a9"></a>states.md, and <a href="#a9">#</a>
      * <a name="a10"></a>states.opml <a href="#a10">#</a>
* <a name="a11"></a>Where to discuss <a href="#a11">#</a>
   * <a name="a12"></a>We have a <a href="https://github.com/scripting/drummerRFC/issues/4#issuecomment-1004429268">thread</a> going on the DrummerRFC site where this work is being narrated, and people are helping out. <a href="#a12">#</a>
