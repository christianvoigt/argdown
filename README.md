# Argdown

![Argdown](https://cdn.rawgit.com/christianvoigt/argdown/master/argdown-mark.svg)

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
    
Argdown can currently be exported to __.html__, __.dot__ and __.json__ files.

## Example
    
```
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
    
## Getting Started

Argdown tools currently available:

  - A browser based [Editor](http://christianvoigt.github.io/argdown) (this repository contains its source code)
  - A [commandline tool](https://github.com/christianvoigt/argdown-cli) that exports Argdown files to html, json, dot and graphml files
  - [Atom Editor Syntax Highlighting](https://github.com/christianvoigt/language-argdown)
  - [CodeMirror Syntax Highlighting](https://github.com/christianvoigt/argdown-codemirror-mode) 
  - [Argdown Parser](https://github.com/christianvoigt/argdown-parser), the basic tools for building Argdown applications
  - [Argdown MapMaker Plugins](https://github.com/christianvoigt/argdown-map-maker) for creating and exporting argument maps from Argdown code

For further technical details, please visit these repositories.

## Documentation

Currently, the project is still in its beta phase, so please excuse the lack of documentation. It is next on our list.

## Build Setup for Argdown Browser Demo

The online editor uses the following frameworks and libraries: 

  - [Vue.js](https://github.com/vuejs/vue) and [Vuex](https://github.com/vuejs/vuex) 
  - The editor uses [CodeMirror](https://github.com/codemirror/CodeMirror) with the [argdown-codemirror-mode](https://github.com/christianvoigt/argdown-codemirror-mode). 
  - The graph visualization uses [dagre-d3](https://github.com/christianvoigt/dagre-d3) and the .dot export in combination with [viz.js.](https://github.com/mdaines/viz.js).

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Credits and license

The development of Argdown and Argdown-related tools is funded by the [DebateLab](http://debatelab.philosophie.kit.edu/) at KIT, Karlsruhe.

All code is published under the MIT license. 
