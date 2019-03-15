---
title: Writing custom plugins
meta:
  - name: description
    content: A short tutorial of how to create custom Argdown plugins.
---

# Writing custom plugins

In this example, we will write a custom plugin that adds proponent names to argument node labels. The proponent names have to be defined in data elements of the arguments.

This is our plugin (written in Typescript):

```typescript
import {
  ArgdownPluginError,
  IArgdownPlugin,
  IRequestHandler,
  IArgdownResponse,
  ArgdownTypes,
  IMapNode,
  isGroupMapNode
} from "@argdown-core";

/**
 * Prepends argument node label text with the argument's proponent name.
 **/
export class SaysWhoPlugin implements IArgdownPlugin {
  name: string = "SaysWhoPlugin"; // obligatory plugin name
  // Will be called by the application:
  run: IRequestHandler = (_request, response) => {
    // let's first check that the required data is present in the response:
    if (!response.arguments) {
      throw new ArgdownPluginError(
        this.name,
        "missing-arguments-field",
        "Missing arguments field in response."
      );
    }
    if (!response.map) {
      throw new ArgdownPluginError(
        this.name,
        "missing-arguments-field",
        "Missing map field in response."
      );
    }
    // now let's search for all argument nodes and change their label
    for (let node of response.map.nodes) {
      processNodesRecursively(node, response);
    }
  };
}
/**
 * We have to use a recursive method as response.map.nodes may contain groups that can have
 * other groups as children.
 **/
const processNodesRecursively = (
  node: IMapNode,
  response: IArgdownResponse
): void => {
  if (node.type === ArgdownTypes.ARGUMENT_MAP_NODE) {
    const argument = response.arguments![node.title!];
    // look for the proponent data and change the label
    if (argument && argument.data && argument.data.proponent) {
      const proponent = argument.data.proponent;
      node.labelText = `${proponent}: ${node.labelText}`;
    }
  } else if (isGroupMapNode(node)) {
    for (let child of node.children!) {
      processNodesRecursively(child, response);
    }
  }
};
```

The SaysWhoPlugin can actually be found in the @argdown/core package, although it is just added for demonstration purposes.

In the [next section](/guide/loading-custom-plugins-in-a-config-file.html), we will continue by loading the plugin in a config file and then running it with the commandline tool.
