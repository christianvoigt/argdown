---
title: Configuration with config files
meta:
  - name: description
    content: How to use config files to change the behaviour of the Argdown tools.
---

# Configuration with config files

You can either create a `argdown.config.json` or `argdown.config.js` file. The VS Code extension will automatically look for either one in your workspace folders. Alternatively you can change where VS Code should look for configuration files in the VS Code settings. The Argdown commandline tool (@argdown/cli) will look for a config file in the folder you are currently executing it. You can also use the `--config` parameter to explicitely telling the cli where to look.

Here is an example of a `argdown.config.json` JSON file:

```json
{
  "selection": {
    "excludeDisconnected": false,
    "selectedSections": ["H1"],
    "statementSelectionMode": "with-relations"
  },
  "map": {
    "statementLabelMode": "text"
  },
  "model": {
    "removeTagsFromText": "true"
  }
}
```

If you are not familiar with the JSON format, take a look at the official [documentation](https://www.json.org/) or this [short introduction](https://learnxinyminutes.com/docs/json/).

:::tip
The VSCode extension will help you write `argdown.config.json` files with code completion, validation and hover context information. See the extension's README for [a small tutorial](https://github.com/christianvoigt/argdown/tree/master/packages/argdown-vscode/README.md#configuration-files) on how to use these features.
:::

Here is an example of the same configuration in a `argdown.config.js` Javascript file:

```javascript
module.exports = {
  selection: {
    excludeDisconnected: false,
    selectedSections: ["H1"],
    statementSelectionMode: "with-relations"
  },
  map: {
    statementSelectionMode: "text"
  },
  model: {
    removeTagsFromText: true
  }
};
```

Instead of putting the settings directly into the module exports, you can also export a config object containing the settings (in this example we are using ES6 Javascript syntax, so make sure it is supported):

```javascript
module.exports = {
  config: {
    selection: {
      excludeDisconnected: false,
      selectedSections: ["H1"],
      statementSelectionMode: "with-relations"
    },
    map: {
      statementSelectionMode: "text"
    },
    model: {
      removeTagsFromText: true
    }
  }
};
```

Using Javascript instead of JSON brings you all the power of a full programming language.
You can use this for example to add custom plugins and [processes](/guide/running-custom-processes.html) on the fly to your Argdown application.

If you are unfamiliar with Javascript it might be safer to stick with JSON, which also brings you performance benefits in case you process a lot of Argdown documents at once (JSON files are loaded asynchronously, while Javascript files are currently loaded synchronously).
