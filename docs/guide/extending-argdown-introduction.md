# Introduction

This guide will teach you how to write your own Argdown plugin, how to load it using a config file, and how to integrate Argdown in your own application. While it is easy to do so, you need to have some experience with Javascript or at least another programming language to follow along.

Additional information on the core classes and interfaces of the Argdown parser can be found in the [API documentation](/api/).

The "Argdown parser" is actually a collection of plugins each doing its own small task. The real lexer and parser are only a small part of this application and are themselves added as a plugin to the application. The application itself does nothing without plugins. Its only job is to organize and manage plugins. In theory it could be used for very different purposes than parsing Argdown. Let us first look at how the ArgdownApplication class does its work.

## Processes, processors and plugins

You add new features to the application by adding a new plugin to a "processor" of the application. A processor consist of a list of plugins that are run, if the application runs this processor. Here is how you add you plugin (assuming you already have created one) and then run it:

```javascript
// Create a new app
const app = new ArgdownApplication();
// Add the plugin
app.addPlugin(myPlugin, "do-some-work");
// Create a request
const request = { process: ["do-some-work"] };
// Run it
app.run(request);
```

You automatically create a new processor, if your plugin is the first plugin added to the "do-some-work" processor. You then create a request object that contains all configuration settings for you plugins and the process that should be run.

A process is simply a list of processor names that the application should execute. So this is the hierarchy of an Argdown application:

- Processes: contain lists of processors
- Processors: contain lists of plugins
- Plugins: do the actual work

This structure makes it easy to change the behaviour of an Argdown application by making changes at different levels of abstraction.

Now what happens exactly, if you call `app.run(request)`? This is what happens basically:

- The application creates a response object, that it passes to every plugin. Every plugin may add or transform data in the response object.
- The application starts with the first processor it finds in the process
- For every plugin in the processor it tries to call its "prepare" method, allowing it to set things up for this run. It passes the request and response objects as parameters.
- For every plugin in the processor it tries to call its "run" method, allowing it to its work. Again it passes the request and response objects as parameters.

After that it looks for the next processor and does the same for its plugins.

An ArgdownApplication chains together a collection of plugins, passing a request and response object between them. Each plugin uses configuration settings from the provided request object to produce or transform data saved in the provided response object. Without any plugins the ArgdownApplication will do nothing. Even the parsing and lexing of Argdown input is accomplished by the ParserPlugin.

Plugins are grouped into processors that will be executed after one another each time the [[run]] method is called. Which processors are executed in a run is determined by the request.process list.

For each processor ArgdownApplication will try to execute plugin methods in the following order:

- any [[IArgdownPlugin.prepare]] methods: these methods can be used to add plugin default settings to the request and to check that all required data is present in the response object.
- any event listeners defined in [[IArgdownPlugin.tokenListeners]] and [[IArgdownPlugin.ruleListeners]]. If any plugin in a processor defines such listeners, an ArgdownTreeWalker will be added to this processor which will visit all nodes in the abstract syntax tree (response.ast).
- any [[IArgdownPlugin.run]] methods: these methods should be used to transform response data not contained within response.ast.

All plugin methods called by ArgdownApplication receive a request, response and logger object as parameters.
In each of the three rounds the plugins are called in the order they were added to the processor.
