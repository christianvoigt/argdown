# Argdown

Try out Argdown in the Browser: [Demo Editor](http://christianvoigt.github.io/argdown).

Argdown is a simple syntax for defining argumentative
structures, inspired by Markdown.

* Writing a pro & contra list in Argdown is as
  simple as writing a twitter message.
* But you can also
  **logically reconstruct** more complex dialectical
  relations between arguments or dive into
  the details of their premise-conclusion structures.
* Finally, you can export Argdown as a graph and create
  **argument maps** of whole debates.

Argdown can currently be exported to **.html**, **.dot** and **.json** files.

![Argdown](https://cdn.rawgit.com/christianvoigt/argdown/master/argdown-mark.svg)

## Getting Started

The easiest way to get started is to install [the Argdown extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=christianvoigt.argdown-vscode). You can learn [here](https://code.visualstudio.com/docs/editor/extension-gallery) how to install extensions in VS Code.

## Example

```argdown
# Example

First we define some relations between statements and arguments:

[statement 1]: A statement
  + <argument 1>: supporting the statement.
  - <argument 2>: attacking the statement.
     + <argument 3>: supporting @<argument 2>.
     -> <argument 4>: is supported by @<argument 2>.
        +> [statement 1]

Now we are reconstructing the logical structure of @<argument 1>:

<argument 1>

(1) A premise
(2) [statement 2]: A premise with a title.
    - <argument 2>
----
(3) A conclusion
    +> [statement 1]
```

To see the resulting graph, paste this code into the [online editor](http://christianvoigt.github.io/argdown) and select "Map" in the menu on the right.

## Argdown tools

Argdown tools currently available:

* A [VS Code extension](https://marketplace.visualstudio.com/items?itemName=christianvoigt.argdown-vscode)
* A browser based [Editor](http://christianvoigt.github.io/argdown) (this repository contains its source code)
* A [commandline tool](https://github.com/christianvoigt/argdown-cli) that exports Argdown files to html, json, dot and graphml files
* [Syntax Highlighting of Argdown code blocks for Pandoc](https://github.com/xylomorph/argdown-pandoc-highlighting)
* [Atom Editor Syntax Highlighting](https://github.com/christianvoigt/language-argdown)
* [CodeMirror Syntax Highlighting](https://github.com/christianvoigt/argdown-codemirror-mode)
* [Argdown Parser](https://github.com/christianvoigt/argdown-parser), the basic tools for building Argdown applications
* [Argdown MapMaker Plugins](https://github.com/christianvoigt/argdown-map-maker) for creating and exporting argument maps from Argdown code

For further technical details, please visit these repositories.

## Documentation

Currently, the project is still in its beta phase, so please excuse the lack of documentation. We are working
on it and our first tutorial will be published soon.

For now, we started a [FAQ](https://github.com/christianvoigt/argdown/wiki/Argdown-FAQ). If you have any questions
open a Github issue and we will try to answer as soon as possible.

## Argdown Online Editor

The online editor uses the following frameworks and libraries:

* [Vue.js](https://github.com/vuejs/vue) and [Vuex](https://github.com/vuejs/vuex)
* The editor uses [CodeMirror](https://github.com/codemirror/CodeMirror) with the [argdown-codemirror-mode](https://github.com/christianvoigt/argdown-codemirror-mode).
* The graph visualization uses [dagre-d3](https://github.com/dagrejs/dagre-d3) and the .dot export in combination with [viz.js.](https://github.com/mdaines/viz.js).

## Credits and license

The development of Argdown and Argdown-related tools is funded by the [DebateLab](http://debatelab.philosophie.kit.edu/) at KIT, Karlsruhe.

All code is published under the MIT license.
