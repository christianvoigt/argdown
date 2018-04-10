# Argdown Parser

A parser for the Argdown argumentation syntax, using the [Chevrotain DSL](https://github.com/SAP/chevrotain).

See the parser in action in the [Argdown Demo](http://christianvoigt.github.io/argdown).

![Argdown](https://cdn.rawgit.com/christianvoigt/argdown-parser/master/argdown-mark.svg)

To learn more about the Argdown argumentation syntax visit the central [Argdown repository](https://github.com/christianvoigt/argdown).

This package contains the basic tools to build an Argdown application:

*   ArgdownParser and ArgdownLexer: parse text and return an abstract syntax tree (AST)
*   ArgdownTreeWalker class: traverses the AST and emits events on entering and exiting nodes
*   ArgdownApplication class: a wrapper that allows to write cleanly separated configurable plugins for processing Argdown data
*   ParserPlugin: the plugin for ArgdownApplication that uses ArgdownParser and ArgdownLexer to parse Argdown input
*   ModelPlugin: a plugin for ArgdownApplication that has to be run before most other plugins to provide a basic data model containing arguments, statements and relations
*   TagPlugin: a plugin that will add tag data to the data model
*   HtmlExport: plugin that exports Argdown code to html
*   JSONExport: plugin that exports Argdown code to JSON

Both export plugins require that the ParserPlugin, ModelPlugin and TagPlugin are run before them (see below). For configuration options of these plugins read the [configuration documentation](https://github.com/christianvoigt/argdown/blob/master/docs/Configuration.md).

Additional plugins that help build argument maps with the parser can be found in the [argdown-map-maker package](https://github.com/christianvoigt/argdown-map-maker).

## Getting started with a new Argdown app

Basic example:

```javascript
import { ArgdownApplication, ParserPlugin, ModelPlugin, TagPlugin, HtmlExport, JSONExport } from "argdown-parser";

const app = new ArgdownApplication();

const parserPlugin = new ParserPlugin();
app.addPlugin(parserPlugin, "parse-input"); // adds the parser plugin to the 'parse-input' processor
const modelPlugin = new ModelPlugin();
app.addPlugin(modelPlugin, "build-model"); // adds the model plugin to the 'build-model' processor
const tagPlugin = new TagPlugin();
app.addPlugin(tagPlugin, "build-model"); // adds the tag plugin to the 'build-model' processor

const htmlExport = new HtmlExport();
app.addPlugin(htmlExport, "export-html"); //adds the htmlExport plugin to the 'export-html' processor

const jsonExport = new JSONExport();
app.addPlugin(jsonExport, "export-json"); //adds the jsonExport plugin to the 'export-json' processor

let request = {
    input: "The Beatles are the best!\n- The Rolling Stones are better!",
    process: ["parse-input", "build-model", "export-html"]
};
let response = app.run(request); // runs the two processors one after another, returning a data object

console.log(response.html);

/*
* Now we run the 'export-json' processor, while passing the result of the previous run to the app.
* By doing this we can avoid to run 'build-model' again,
* even though the JSONExport plugin requires the data produced by the processor.
*/
response = app.run({ process: ["export-json"] }, response);

console.log(response.json);
```

## How ArgdownApplication processes Argdown text

Processing Argdown text with an ArgdownApplication app is done by running different "processors" after one another, passing the same request and response objects between them (`app.run(request);`). The request object contains the Argdown input, the processors to be run and configuration options for the plugins. The response object is used by the plugin to store processed data. Plugins can add their default settings to the request and should change the response object, while callers of app.run only configure the request object.

Normally, the first processor runs the ParserPlugin that parses the ArgdownInput and adds an abstract syntax tree (AST) to the response object (`response.ast`). Subsequent processors can access response.ast and add additional properties to the response object. Processors that run before the processors that parses the input can be used to add "preprocessors" to the app (for example loading files or changing the input data). Alternatively, a plugin's "prepare" method can be used for the same purpose.

Building the application means adding plugins to different processors of the app. A new processor is created by simply adding a plugin to a processor that has not been initialized before (using `app.addPlugin(plugin, processorName);`).

Each processor has its own instance of an ArgdownTreeWalker and a list of plugins belonging to this processor. If the app runs the process it will

*   call all `prepare` methods of the plugins so that the plugins can add their default settings to the request
*   call the `walk` method of the processor's ArgdownTreeWalker if the response already has an ast property. The tree walker will traverse the tree and call any plugins that have registered for its events passing the request and response objects along. Plugins can use the listeners to collect and transform data and add it to the response object.
*   After the tree walk has been completed, the app calls each plugin's `run(request, response, logger)` method in the order they have been registered, once again passing the same request and response objects between the plugins. Each plugin can add data to the response object and is expected to return it on completing its run method.

By using a common request and response objects plugins are thus chained together without keeping any application state within the application or plugins themselves. This makes it possible to add the ability to run several requests asynchronously (for an example look at the source code of argdown-cli).

## Writing your own plugin

A plugin is an object with

*   a name property
*   an optional prepare method
*   an optional dictionary of argdownListener handler methods
*   an optional run method

Example:

```javascript
import {ArgdownApplication} from 'argdown-parser';

const plugin = {
  name: 'TestPlugin',
  run(request, response, logger){
      logger.log('verbose', 'TestPlugin.run has been called!');
      response.test = "some new data";
      return response;
  },
  argdownListeners{
    argdownEntry: function(request, response, node, parentNode, childIndex, logger){
      logger.log('logger', 'Tree traversal started.');
    },
    statementEntry: function(request, response, node, parentNode, childIndex, logger){
      logger.log('verbose', 'TestPlugin event listener has been called on statement entry!');
      logger.log('verbose', node.statement.text);
    }
    argdownExit: function(){
      logger.log('verbose', 'Tree traversal finished.');
    }
  }
};

const app = new ArgdownApplication();
app.addPlugin(plugin); // omitting a processor name will add the plugin to the default processor
app.run({input: "Hallo World!", logLevel: "verbose"}); // omitting the process array will run the default processor
```

The ArgdownTreeWalker will emit `[node-name]Entry` and `[node-name]Exit` events for each parser rule or token visited. Note that token names are capitalized, while parser rule names are not.

After parsing some Argdown text you can use `console.log(app.parser.astToString(response.ast);` to print the AST to the console and learn about the parser rule and token names in the AST. For each entry in the AST you can register listeners for your plugin.

You can also use the online [Demo Editor](christianvoigt.github.io/argdown) and use the "Debug/Parser & Lexer" view to inspect the AST structure.

## Configuration

Argdown plugins can add their default settings to the request object. Here is the plugin from above, changed to es6 class syntax with configuration options added. This pattern is used for all standard Argdown plugins:

```JavaScript
import * as _ from 'lodash';

class MyNewPlugin{
  getSettings(request){ // get the plugin's settings from the request object
    if(!request.myNewPluginSettings){
      request.myNewPluginSettings = {};
    }
    return request.myNewPluginSettings;
  }
  prepare(request){ // adds the default plugin settings to the request object
    _.defaultsDeep(this.getSettings(request), this.defaults)
  }
  constructor(config){ // config may contain special default settings for this instance
    // The default settings for all instances
    let defaultSettings = {
      configOption: true
    };
    this.defaults = _.defaultsDeep({}, config, defaultSettings); // both sets of default settings are merged
    this.name = 'MyNewPlugin';
    this.argdownListeners = {
      argdownEntry: function(request, response, node, parentNode, childIndex, logger){ // each listener receives the request and response objects
        const settings = $.getSettings(request); // get the settings from the request object
        logger.log('verbose' 'Tree traversal started. ConfigOption is '+settings.configOption);
      }
    }
  }
  run(request, response, logger){
      const settings = this.getSettings(request);
      logger.log('verbose','TestPlugin.run has been called! ConfigOption is '+settings.configOption);
      response.test = "some new data";
      return response;
  }
};
const myNewPlugin = new MyNewPlugin({
  configOption: false // special default settings for this instance
});

const app = new ArgdownApplication();
app.addPlugin(myNewPlugin); // omitting a processor name will add the plugin to the default processor
app.run({input: "Hallo World!", logLevel: "verbose", myNewPluginSettings: {configOption: true}}); // adds special plugin settings for this request
```

## Logging

Instead of directly logging to the console, plugins should use the logger provided as parameter by the ArgdownApplication in the run methods and argdownListeners (see above):

```
logger.log(logLevel, logMessage);
```

This allows you to implement your own logging mechanism (e.g. using the Winston logging library). Simply initialize the ArgdownApplication with your own logger. The logger object has to have two methods: `setLogLevel(level)` and `log(level, message)`. Here is an example:

```Javascript
var myCustomLogger = {
  setLevel(level){
    this.logLevel = level;
  },
  log(level, message){
    if(level == "verbose"){
      if(this.logLevel == "verbose"){
        console.log(message);
      }
    }else{
      console.log(message);
    }
  }
};

var app = new ArgdownApplication(myCustomLogger);
```
