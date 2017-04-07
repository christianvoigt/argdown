# Argdown Parser

![Argdown](https://cdn.rawgit.com/christianvoigt/argdown-parser/master/argdown-mark.svg)

Parser for the Argdown Syntax, using the [Chevrotain DSL](https://github.com/SAP/chevrotain).

See the parser in action in the [Argdown Demo](http://christianvoigt.github.io/argdown).

For more information on the Argdown argumentation syntax visit the [Argdown repository](https://github.com/christianvoigt/argdown).

This package contains the basic tools to build an Argdown application:

  - ArgdownParser and ArgdownLexer: parse text and return an abstract syntax tree (AST)
  - ArgdownTreeWalker class: traverses the AST and emits events on entering and exiting nodes
  - ArgdownApplication class: a wrapper that allows to write cleanly separated plugins for processing Argdown data
  - Preprocessor plugin: a plugin for ArgdownApplication that has to be run before most other plugins to provide a basic data model containing arguments, statements and relations
  - HtmlExport: plugin that exports Argdown code to html

Additional plugins that help build argument maps with the parser can be found in the [argdown-map-maker package](https://github.com/christianvoigt/argdown-map-maker).

# Getting Started

Basic example:

```javascript
import {ArgdownApplication, Preprocessor, HtmlExport} from 'argdown-parser';

const app = new ArgdownApplication();

const preprocessor = new Preprocessor();
app.addPlugin(preprocessor, 'preprocessor'); // adds preprocessor plugin to the 'preprocessor' processor

const htmlExport = new HtmlExport();
app.addPlugin(htmlExport, 'export-html'); //adds htmlExport plugin to the 'export-html' processor

app.parse('The Beatles are the best!\n- The Rolling Stones are better!');
let result = app.run(['preprocessor','run-html']); // runs the two processors one after another, returning a data object

console.log(result.html);
```

# How ArgdownApplication processes Argdown text

Processing Argdown text with an ArgdownApplication app consist of two steps: First `app.parse(text);` has to be called to lex and parse the text and return the AST (you can access the ast afterwards with `app.ast`). Secondly, different "processors" can be run to process the data in the AST. Building the application means adding plugins to the processors of the app. A new processor is created by simply adding a plugin to a processor that has not been initialized before (using `app.addPlugin(plugin, processorName);`).

Each processor has its own instance of an ArgdownTreeWalker and a list of plugins belonging to this processor. If the app runs the process it will first call the `walk` method of the processor's ArgdownTreeWalker. The tree walker will traverse the tree and call any plugins that have registered for its events. After the tree walk has been completed, the app calls each plugin's `run(data)` method in the order they have been registered, passing the same data object between the plugins. Each plugin can add data to this object and is expected to return the data object on completing its run method. By using a common data object plugins are thus chained together.

Different procesors can also be chained together by either using `app.run(['processor1','processor2'])` or by calling the app's run method with a previous run's result:

```javascript
let data = app.run('preprocessor');
data = app.run('export-html', data);
data = app.run('export-dot', data);
```

This method allows to only run the preprocessor once, using its result for several different processors that will be called on different occasions.

# Writing your own plugin

A plugin is an object with 

  - a name property
  - a run method
  - or an argdownListener property

Example:
  
```javascript
import {ArgdownApplication} from 'argdown-parser';

const plugin = {
  name: 'TestPlugin',
  run(data){
      console.log('TestPlugin.run has been called!');
  },
  argdownListeners{
    argdownEntry: function(){
      console.log("Tree traversal started.");
    },
    statementEntry: function(node, parentNode){
      console.log('TestPlugin event listener has been called on statement entry!');
      console.log(node.statement.text);
    }
    argdownExit: function(){
      console.log("Tree traversal finished.");
    }
  }
};

const app = new ArgdownApplication();
app.addPlugin(plugin); // omitting a processor name will add the plugin to the default processor
app.parse("Hallo World!");
app.run(); // omitting a processor name will run the default processor

```

The ArgdownTreeWalker will emit [node-name]Entry and [node-name]Exit events for each parser rule or token visited. Note that token names are capitalized, while parser rule names are not.

After parsing some Argdown text you can use `console.log(app.parser.astToString(app.ast);` to print the AST to the console and learn about the parser rule and token names in the AST. For each entry in the AST you can register listeners for your plugin.
