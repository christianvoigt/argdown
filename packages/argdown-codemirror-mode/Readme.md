# argdown-codemirror-mode

A simple Codemirror syntax highlighting mode for the Argdown argumentation syntax.

![Argdown](https://cdn.rawgit.com/christianvoigt/argdown/master/argdown-mark.svg)

For a live demo of this mode see the [Argdown Demo](http://christianvoigt.github.io/argdown).

For more information on Argdown visit the [Argdown repository](https://github.com/christianvoigt/argdown).

# how to register the mode with CodeMirror:

```javascript
var mode = require('argdown-codemirror-mode');
var CodeMirror = require('codemirror');

// Activate the simple mode addon
require('codemirror/addon/mode/simple.js')

// Load the stylesheet (if using webpack)
require('./node_modules/argdown-codemirror-mode/codemirror-argdown.css')

// Define the mode
CodeMirror.defineSimpleMode('argdown', mode);
```

To see any results you have to load 'codemirror-argdown.css' in your html file.
