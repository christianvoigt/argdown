---
title: Loading custom plugins
meta:
  - name: description
    content: How to load custom plugins in a config file
---

# Loading custom plugins in a config file

Now let's add our toy plugin from the [previous section](/guide/writing-custom-plugins.html) into Argdown and run it. We can use an `argdown.config.js` file for that (Read the guide on configuration for more information on [how to run custom processes](/guide/running-custom-processes)):

```Javascript
import {SaysWhoPlugin} from "@argdown/core";

module.exports{
    plugins: [{plugin: new SaysWhoPlugin(), processor: "add-proponents"}],
    processes: {
        "says-who-map": {
            // We could add additional configuration settings here.
            // But currently we only want to define our process here:
            process: [
            "load-file", // loads Argdown files (request.input)
            "parse-input", // parses them (response.ast)
            "build-model", // builds the data model (response.arguments, response.statements...)
            "build-map", // creates the map (response.map)
            "add-proponents", // our new processor with the SaysWhoPlugin
            "export-dot", // exports the map into dot format
            "export-svg" // exports the dot file into svg format
            ]
        }
    }
}
```

What is crucial for our plugin is that we insert it in the process after the map has been created, because we want to change the created nodes. This is why the `add-proponents` processor is added after the `build-map` processor.

Let us create a little test debate:

```argdown
===
title: The test debate without running the SaysWhoPlugin
sourceHighlighter:
    removeFrontMatter: true
===

# Section 1

<a>: Quack! {proponent: Donald Duck}
    - <b>
    + <c>

## Section 2

<b>: D'oh! {proponent: Homer Simpson}

<c>: Pretty, pretty, pretty, pretty good. {proponent: Larry David}

```

We can now run our plugin with the commandline tool, assuming that the config file and our Argdown document are in the current working directory:

```sh
argdown run says-who-map
```

This should create an svg file with a map where proponent names have been added:

```argdown-sayswho
===
title: The test debate after running the SaysWhoPlugin
sourceHighlighter:
    removeFrontMatter: true
===

# Section 1

<a>: Quack! {proponent: Donald Duck}
    - <b>
    + <c>

## Section 2

<b>: D'oh! {proponent: Homer Simpson}

<c>: Pretty, pretty, pretty, pretty good. {proponent: Larry David}

```
