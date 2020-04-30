---
title: Using Argdown in your application
meta:
  - name: description
    content: How to integrate the Argdown tools into your own application.
---

# Using Argdown in your application

So far, we have only extended Argdown through config files. If you want to use Argdown in your own application, it is also easy to do so. If you are writing a node application, you can use the `@argdown/node` package which provides you with the pre-built `AsyncArgdownApplication` instance that is used in the VS Code extension and in the commandline tool.

We will add our toy plugin from the [previous sections](/guide/writing-custom-plugins.html) to the argdown app and run it. We are adding the same process we have defined previously in a config file to the argdown application itself.

```typescript
import {argdown} from "@argdown/node";
import {SaysWhoPlugin, IArgdownRequest} from "@argdown/core";

argdown.addPlugin(new SaysWhoPlugin(), "add-proponents");
argdown.defaultProcesses["say-who-map"]: [
  "parse-input", // parses them (response.ast)
  "build-model", // builds the data model (response.arguments, response.statements...)
  "build-map", // creates the map (response.map)
  "add-proponents", // our new processor with the SaysWhoPlugin
  "export-dot", // exports the map into dot format
  "export-svg" // exports the dot file into svg format
];

// Here is our example debate from before again:
const input = `
# Section 1

<a>: Quack! {proponent: Donald Duck}
    - <b>
    + <c>

## Section 2

<b>: D'oh! {proponent: Homer Simpson}

<c>: Pretty, pretty, pretty, pretty good. {proponent: Larry David}
`;

// We have to create a request with the input and our process
const request:IArgdownRequest = {
    input,
    process: "says-who-map"
}
// Now we can run our request and hopefully we will get the svg data back:
const response = argdown.run(request);
console.log(response.svg);
```

For more information about how the `ArgdownApplication` class manages plugins, processors and processes, please consult the [API documents](/api/) of `@argdown/core` and `@argdown/node`.

If you need further help integrating Argdown into your own application or writing custom plugins, you can also open an issue in the [Argdown Github repository](https://github.com/christianvoigt/argdown/issues).
