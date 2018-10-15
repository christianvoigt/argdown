# @argdown/codemirror-mode

![Argdown logo](../../argdown-arrow.png?raw=true "Argdown logo")

A simple Codemirror syntax highlighting mode for the Argdown argumentation syntax.

For a live demo of this mode see the [Argdown Demo](https://christianvoigt.github.io/argdown/sandbox).

This package is part of the [Argdown project](https://christianvoigt.github.io/argdown).

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
