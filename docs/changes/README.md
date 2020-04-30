# Release Notes 2020

## v1.4.0 (April 2020)

**Changes in:** @argdown/core, @argdown/node, @argdown/vscode, @argdown/sandbox, @argdown/codemirror-mode, docs

**New packages:** @argdown/web-components, @argdown/remark-plugin, @argdown/gatsby-remark-plugin, @argdown/markdown-it-plugin, @argdown/marked-plugin, @argdown/highlightjs

This release is improving the Argdown workflow significantly: It is now possible to

- use [Argdown _within_ Markdown](#using-argdown-in-markdown) documents and export the whole document with Argdown web components to HTML
- copy & paste your argument map as [Argdown web component](#the-argdown-web-component) into any web page
- [integrate Argdown](#remark-markdown-it-and-marked-plugins) into [static site generators](https://www.staticgen.com/) and similar applications _by simply changing their Markdown parser configuration_

### VSCode extension: Using Argdown in Markdown

You can now use Argdown directly in Markdown documents by using code fences. Your Argdown code fences will be correctly highlighted.

If you open the Markdown preview, it will automatically replace the Argdown code fences with a web component showing the Viz.js argument map.

````markdown
# A Markdown header

Now comes the _Argdown_ map:

```argdown

===
title: my argdown map
===

[S]: Some statement
    <- <A>: Some argument
```

Now we are back in Markdown.
````

For more details read the guide on [using Argdown in Markdown](/guide/using-argdown-in-markdown).

### The Argdown Web Component

The web component allows you to switch between a zoomable map and a syntax-highlighted source view, just like in the Argdown documentation (which from now on also uses the new web component).

Both the commandline tool and the VSCode extension provide a new "web component" export, that will wrap your source code and Viz.js map in a custom html element. By exporting your documents as web components you can "copy & paste" them into any html document to embed your maps into your webpage.

In `@argdown/cli` use the new `argdown web-component [inputGlob] [outputFolder]` command to export your argdown file as web component html.

For more details on how to setup and configure the web component, read the guide on [how to embed your argument maps in a web page](/guide/using-argdown-in-markdown).

### Remark, Markdown-It and Marked plugins

If you want to export a complete Markdown document containing Argdown code fences to HTML you now have four options:

- use the new `argdown markdown [inputGlob] [outputFolder]` command of `@argdown/cli` (internally it uses markdown-it to parse the markdown)
- use [remark](https://github.com/remarkjs/remark) together with `@argdown/remark-plugin` or use `@argdown/gatsby-remark-plugin` in [Gatsby](https://www.gatsbyjs.org/).
- use [markdown-it](https://github.com/markdown-it/markdown-it) together with `@argdown/markdown-it-plugin`
- use [marked](https://github.com/markedjs/marked) together with `@argdown/marked-plugin`

All of these exports will replace Argdown code fences with the Argdown web component just as the VSCode Markdown preview does (if you have installed the Argdown VSCode extension).

The Markdown parser plugins can be used to integrate Argdown support into any of the many applications that use these parsers, for example static site generators like [Gatsby](https://www.gatsbyjs.org/), [Eleventy](https://www.11ty.dev/) or [Vuepress](https://vuepress.vuejs.org/).

Read more about how to set this up in the guide on [how to integrate Argdown-Markdown into existing applications](/guide/how-to-integrate-argdown-markdown-into-existing-applications).

### Highlight.js plugin

This release also adds a [highlight.js](https://github.com/highlightjs/highlight.js/) plugin with Argdown language support. The plugin is used to add syntax highlighting in the web component export.

The plugin can also be used on its own, if you don't want to use the web component, but want to add syntax highlighting to Argdown source code.

For the same purpose you might also be interested in our old [prismjs](https://prismjs.com/) plugin in the Argdown repository.

### Bug fixes

- argdown-vscode: Argdown configuration files in your workspace folder are now used if you export your Argdown file into other formats (you can use the VSCode settings to set the filename of your config file)
- #138: No italic in Viz.js map: Italic, bold and link ranges are now supported in Viz.js and GraphML (not yet in Dagre)
- #144: broken links custom shortcodes

### Thanks

Thanks to [Antoine du Hamel](https://github.com/aduh95) for creating and maintaining a new fork of [Viz.js](https://github.com/aduh95/viz.js) after the original repository was abandoned. Argdown is now using this new version in the web component export and will switch completely to it as soon as VSCode is based at least on node v13.

## Older releases

For the relase notes of 2019 visit [this page](https://argdown.org/changes/2019.html).
