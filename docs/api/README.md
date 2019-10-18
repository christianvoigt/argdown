---
sidebar: auto
title: API
meta:
  - name: description
    content: API documentation for the packages of the Argdown project.
---

# API

The Argdown repository is a "monorepo" containing a number of different npm packages in its `/packages` folder. All are published under the `@argdown` namespace and the MIT license. The two most important packages are @argdown/core and @argdown/node. Both packages have their own extensively commented API documentation. Here is a list of all packages with links to their documentations or README files.

All packages except @argdown/sandbox are written in Typescript and compiled to Javascript.

## @argdown/core

[API documentation](https://christianvoigt/github.io/argdown/argdown-core/)

Contains the Argdown parser and lexer, the basic ArgdownApplication class that manages plugins and the plugins for all central tasks, including the ParserPlugin, ModelPlugin, MapPlugin, HtmlExportPlugin, JSONExportPlugin, DotExportPlugin. This package is used in all tools using the Argdown parser.

## @argdown/node

[API documentation](https://christianvoigt/github.io/argdown/argdown-node/)

Contains the AsynArgdownApplication subclass supporting asynchronous plugin methods. Instantiates this class with all plugins and processes preconfigured and predefined so that you can use it directly without any additional setup. Provides plugins that are specific to Argdown applications that are running in Node.js and not in the browser, for example the LoadFilePlugin and the SaveAsPlugin.

## @argdown/map-views

[README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-map-views/README.md)

Contains the VizJs and Dagre map views used in the live previews of @argdown/sandbox and argdown-vscode.

## @argdown/sandbox

[README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-sandbox/README.md)

The browser-based editor. This is a Vue-application depending on @argdown/core and @argdown/map-views.

## @argdown/language-server

[README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-language-server/README.md)

An editor-agnostic language server for the Argdown language with code linter, code assistance and code completion providers. Implements the [language server protocol](https://langserver.org/) and depends on @argdown/core and @argdown/node.

## @argdown/vscode

[README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-vscode/README.md)

The VS Code extension, depending on @argdown/core, @argdown/node, @argdown/language-server and @argdown/map-views

## @argdown/cli

[README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-cli/Readme.md)

The commandline tool, depending on @argdown/node and @argdown/core.
