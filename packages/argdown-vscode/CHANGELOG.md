# Release Notes 2020

## v1.5.x (July 2020)

Apart from some smaller bug-fixes and features, this release brings **three major improvements**:

- With the new [Pandoc filter](https://argdown.org/guide/publishing-argdown-markdown-with-pandoc.html) you can now publish Argdown-in-Markdown documents as pdf files.
- The Pandoc filter and `@argdown/cli` can be extended by installing the new `@argdown/image-export` plugin that allows to [export maps to png, jpg and webp images](https://github.com/christianvoigt/argdown/tree/master/packages/argdown-image-export/).
- The VSCode extension now adds [IntelliSense, validation, hover descriptions and quick navigation for `argdown.config.js` files](https://github.com/christianvoigt/argdown/tree/master/packages/argdown-vscode/README.md#configuration-files) making it much easier to find your way through the file format and the many configuration options.

### Additional features & bug fixes

- Using the command `argdown [input file glob]` you can check the validity of your Argdown files. `@argdown/cli` will return with errorCode 1 if there are any errors (closes [#167](https://github.com/christianvoigt/argdown/issues/167)).
- In general, `@argdown/cli`'s error handling and logging has been improved to give more feedback to the user. If you don't want the additional "noise", use the new `--silent` flag.
- You can now [set the line width and arrow size]() of edges in dot graphs (closes [#168](https://github.com/christianvoigt/argdown/issues/168))
- You can now [customize the colors of the web-component](https://argdown.org/guide/embedding-your-maps-in-a-webpage.html#styling-the-component) by using css variables.
- VSCode's new API for webview resources has been adopted (closes [#160](https://github.com/christianvoigt/argdown/issues/160)).
- The VSCode extension no longer fails to export files if no workspace is open (fixes [#159](https://github.com/christianvoigt/argdown/issues/159)).
- Upgraded parser to [Chevrotain 7.0.1](https://github.com/SAP/chevrotain)
- Upgraded to [@aduh95/viz.js 3.1.0](https://github.com/aduh95/viz.js) in all packages using Viz.js

As always, all package dependencies have been upgraded.

Thanks again to [Antoine du Hamel](https://github.com/aduh95) for his work on maintaining [@aduh95/viz.js](https://github.com/aduh95/viz.js).

### Patches

#### 1.5.1

- `@argdown/cli`: Fixes missing `import-global` package ([#179](https://github.com/christianvoigt/argdown/issues/179))

#### 1.5.2

- `@argdown/cli` & `@argdown/node`: Fixes uncaught EExist error when running `argdown html` ([#180](https://github.com/christianvoigt/argdown/issues/180))
- `@argdown/image-export`: fixes missing `@argdown/node` dependency (was only devDependency), ([#186](https://github.com/christianvoigt/argdown/issues/186))
- `@argdown/pandoc-filter`: fixes typescript compilation of optional chaining, ([#187](https://github.com/christianvoigt/argdown/issues/186))

### 1.5.3

- `@argdown/node`, `@argdown/language-server`, `argdown-vscode`: Fixes svg/png export in VSCode by reverting to SyncDotToSvgExportPlugin ([#193](https://github.com/christianvoigt/argdown/issues/193))
- `@argdown/language-server`, `argdown-vscode`: upgrade bundling configs to webpack 5

## v1.4.x (April 2020)

This release is improving the Argdown workflow significantly: It is now possible to

- use [Argdown _within_ Markdown](#using-argdown-in-markdown) documents and export the whole document with Argdown web components to HTML
- copy & paste your argument map as [Argdown web component](#the-argdown-web-component) into any web page
- [integrate Argdown](#remark-markdown-it-and-marked-plugins) into [static site generators](https://www.staticgen.com/) and similar applications _by simply changing their Markdown parser configuration_

For a list of bug fixes in this release cycle, see the notes for the specific versions below the new feature sections.

The VSCode extension 1.4.x requires VSCode version >= 1.43.0. Please update VSCode!

### Using Argdown in Markdown

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

For more details read the guide on [using Argdown in Markdown](https://argdown.org/guide/using-argdown-in-markdown.html).

### The Argdown Web Component

The web component allows you to switch between a zoomable map and a syntax-highlighted source view, just like in the Argdown documentation (which from now on also uses the new web component).

Both the commandline tool and the VSCode extension provide a new "web component" export, that will wrap your source code and Viz.js map in a custom html element. By exporting your documents as web components you can "copy & paste" them into any html document to embed your maps into your webpage.

In `@argdown/cli` use the new `argdown web-component [inputGlob] [outputFolder]` command to export your argdown file as web component html.

For more details on how to setup and configure the web component, read the guide on [how to embed your argument maps in a web page](https://argdown.org/guide/embedding-your-maps-in-a-webpage.html).

### Remark, Markdown-It and Marked plugins

If you want to export a complete Markdown document containing Argdown code fences to HTML you now have four options:

- use the new `argdown markdown [inputGlob] [outputFolder]` command of `@argdown/cli` (internally it uses markdown-it to parse the markdown)
- use [remark](https://github.com/remarkjs/remark) together with `@argdown/remark-plugin` or use `@argdown/gatsby-remark-plugin` in [Gatsby](https://www.gatsbyjs.org/).
- use [markdown-it](https://github.com/markdown-it/markdown-it) together with `@argdown/markdown-it-plugin`
- use [marked](https://github.com/markedjs/marked) together with `@argdown/marked-plugin`

All of these exports will replace Argdown code fences with the Argdown web component just as the VSCode Markdown preview does (if you have installed the Argdown VSCode extension).

The Markdown parser plugins can be used to integrate Argdown support into any of the many applications that use these parsers, for example static site generators like [Gatsby](https://www.gatsbyjs.org/), [Eleventy](https://www.11ty.dev/) or [Vuepress](https://vuepress.vuejs.org/).

Read more about how to set this up in the guide on [how to integrate Argdown-Markdown into existing applications](https://argdown.org/guide/integrating-argdown-markdown-into-applications.html).

### Highlight.js plugin

This release also adds a [highlight.js](https://github.com/highlightjs/highlight.js/) plugin with Argdown language support. The plugin is used to add syntax highlighting in the web component export.

The plugin can also be used on its own, if you don't want to use the web component, but want to add syntax highlighting to Argdown source code.

For the same purpose you might also be interested in our old [prismjs](https://prismjs.com/) plugin in the Argdown repository.

### Thanks

Thanks to [Antoine du Hamel](https://github.com/aduh95) for creating and maintaining a new fork of [Viz.js](https://github.com/aduh95/viz.js) after the original repository was abandoned. Argdown is now using this new version in the web component export and will switch completely to it as soon as VSCode is based at least on node v13.

### Detailed Fixes & Changes

#### v1.4.9

- @argdown/core: fixed lodash.merge import #156

#### v1.4.8

- @argdown/web-components: fixed map disappears on zoom in Firefox #155

#### v1.4.7

- @argdown/core: fixed files property in package.json

#### v1.4.6

everything finally released

- @argdown/sandbox: changes to webpack config, enabled treeshaking, reduced file size from 8mb to 2mb, finally ready for release on argdown.org
- @argdown/core: fixed bold/italic ranges in argument labels
- @argdown/core: reduced footprint by using highlightjs core and removing SyncDotToSvgExportPlugin from index (has to be imported explicitely now)
- @argdown/node: reduced footprint by removing lodash dependency from AsyncArgdownApplication
- @argdown/web-components: fixed check if slots are filled (did not work on argdown.org)

#### v1.4.5

argdown-vscode released

docs & sandbox not yet released because of build problems

- @argdown/language-server & argdown-vscode: new build process, after many fixes (see below), webpack bundling is finally working, VSCode extension can now be released on store
- @argdown/core: fixed WebComponentExportPlugin's web-component script loading

#### v1.4.4

argdown-vscode, docs & sandbox not yet released because of build problems

- @argdown/web-components: downgrading to parcel 1, to fix jsdelivr file urls (parcel 2 is to unstable and unpredictable right now)
- @argdown/node: further clean up for bundling with webpack

#### v1.4.3

argdown-vscode, docs & sandbox not yet released because of build problems

- @argdown/node: changes to tsconfig, fixes problems with packing in @argdown/vscode
- @argdown/node: better import of lodash functions
- @argdown/web-components: trying to fix parcel 2 build process, using jsdelivr does not work right now

#### v1.4.2

argdown-vscode, docs & sandbox not yet released because of build problems

- @argdown/cli: fixes name in cli help from cli.js to argdown (yargs changed)

#### v1.4.1

argdown-vscode, docs & sandbox not yet released because of build problems

- @argdown/cli: fixes missing help in @argdown/cli
- @argdown/markdown-it-plugin: fixes missing file load in @argdown/markdown-it-plugin
- @argdown/web-components): fix build paths

#### v1.4.0

**Changes in:** @argdown/core, @argdown/node, argdown-vscode, @argdown/language-server, @argdown/sandbox, @argdown/codemirror-mode, docs

**New packages:** @argdown/web-components, @argdown/remark-plugin, @argdown/gatsby-remark-plugin, @argdown/markdown-it-plugin, @argdown/marked-plugin, @argdown/highlightjs

argdown-vscode, docs & sandbox not yet released because of build problems

- argdown-vscode: Argdown configuration files in your workspace folder are now used if you export your Argdown file into other formats (you can use the VSCode settings to set the filename of your config file)
- #138: No italic in Viz.js map: Italic and bold ranges are now kind of supported in Viz.js and GraphML (not yet in Dagre): Graphviz rendering seems to be buggy in this respect, it will not display an empty space after an italic or bold range. As a workaround, an extra empty space is now added automatically, but this is a hack that might lead to problems in yEd or in the future if this bug is finally fixed. Link ranges are not supported at all in Graphviz (only tables and cells can have a href attribute).
- #144: broken links custom shortcodes

## Older releases

For the relase notes of 2019 visit [this page](https://argdown.org/changes/2019.html).
