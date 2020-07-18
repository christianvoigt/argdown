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

## @argdown/image-export

[README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-image-export/README.md)

Provides png, jpg and webp export plugin. If installed (`npm install -g @argdown/image-export`) will be automatically used by `@argdown/cli` and `@argdown/pandoc-filter`. This is not part of `@argdown/node` because of its file size and dependency on chrome/chromium, which might cause problems in some linux installations.

## @argdown/map-views

[README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-map-views/README.md)

Contains the VizJs and Dagre map views used in the live previews of @argdown/sandbox and argdown-vscode.

## @argdown/web-components

[README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-web-components/README.md)

Contains web-component used in the markdown-it, remark, marked, gatsby plugins and the pandoc filter. The VSCode extension uses the component in the Markdown preview. The Argdown documentation also uses the web-component for all Argdown snippets.

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

## @argdown/pandoc-filter

[README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-pandoc-filter/README.md)

Pandoc filter that allows to generate Argdown-in-Markdown pdfs and html files.

## @argdown/markdown-it-plugin

[README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-markdown-it-plugin/README.md)

Markdown-it plugin that converts Argdown codeblocks to the web-component

## @argdown/marked-plugin

[README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-marked-plugin/README.md)

Marked plugin that converts Argdown codeblocks to the web-component

## @argdown/remark-plugin

[README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-remark-plugin/README.md)

Remark plugin that converts Argdown codeblocks to the web-component

## @argdown/gatsby-plugin

[README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-gatsby-plugin/README.md)

Gatsby plugin that converts Argdown codeblocks to the web-component. Uses the remark plugin.

## @argdown/highlightjs

[README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-highlightjs/README.md)

Highlightjs syntax highlighting support for Argodwn.

## @argdown/prism

[README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-prism/README.md)

Prism.js syntax highlighting support for Argdown.

## @argdown/codemirror-mode

[README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-codemirror-mode/README.md)

Simple Codemirror mode for Argdown syntax highlighting support.

## ArgVu

[README](https://github.com/christianvoigt/argdown/blob/master/packages/ArgVu/README.md)

A font for Argdown with nice ligatures.
