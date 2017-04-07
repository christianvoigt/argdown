# Argdown

![Argdown](https://cdn.rawgit.com/christianvoigt/argdown/master/argdown-mark.svg)

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
    
# Example
    
```
[statement 1]: A statement
  + <argument 1>: supporting the statement.
  - <argument 2>: attacking the statement.
     + <argument 3>: supporting @<argument 2>.
     -> <argument 4>: is supported by @<argument 2>.
        +> [statement 1] <!-- @<argument 4> is supporting @[statement 1]-->

<!-- Now we are logically reconstructing @<argument 1> -->
<argument 1>

(1) A premise
(2) [statement 2]: A premise with a title.
    - <argument 2> <!-- the second premise is attacked by @<argument 2> -->
----
(3) A conclusion
    +> [statement 1] <!-- the conclusion is supporting @[statement 1] -->   
```
    
# Getting Started

Try out Argdown in the Browser: [Demo Editor](http://christianvoigt.github.io/argdown).

The following Argdown tools currently exist:

  - A browser based [Editor](http://christianvoigt.github.io/argdown) (this repository contains its source code)
  - A [commandline tool](https://github.com/christianvoigt/argdown-cli) that exports Argdown files to html, dot and graphml files
  - [Argdown Syntax Highlighting](https://github.com/christianvoigt/language-argdown) for the Atom Editor
  - [Argdown Syntax Highlighting](https://github.com/christianvoigt/argdown-codemirror-mode) for CodeMirror
  - [Argdown Parser](https://github.com/christianvoigt/argdown-parser), the basic tool for building Argdown applications
  - [Argdown Parser Plugins](https://github.com/christianvoigt/argdown-map-maker) for creating and exporting argument maps from Argdown code

For further technical details, please visit these repositories.

The development of Argdown and Argdown-related tools is funded by the [DebateLab](http://debatelab.philosophie.kit.edu/) at KIT, Karlsruhe. All code is published under the MIT license. 

Currently, the project is still in its alpha phase, so please excuse the lack of documentation. We are working on it.

## Build Setup for Argdown Browser Demo

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
