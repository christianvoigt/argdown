# Release Notes 2021

## v1.7.2-12 (September-November 2021)

These small patch releases update dependencies, bundling processes and fix a small bug in the VSCode syntax highlighting ([#285](https://github.com/christianvoigt/argdown/issues/285)).

## v1.7.x (February 2021)

This release adds features that let you further adapt Argdown maps to your style of reconstruction.

First of all, you can now use [icons and images](#adding-images-to-your-nodes) in your nodes to visually categorize your statements and arguments or make them visually more distinct from each other.

Secondly, Argdown is now better suited to produce [inference trees](#creating-old-school-argument-maps-and-inference-trees) from complex arguments. You can now produce argument maps that more closely resemble other argument mapping tools that do not have the concept of arguments as "containers" of premise-conclusion structures but rather treat arguments as "connectors" between premises and a conclusion in a map.

### Adding images to your nodes

You can now use tags or metadata to add images to statements or arguments. Here is a simple example:

```argdown-map
===
model:
  mode: strict
dot:
    statement:
        images:
            position: bottom
===

[Dogs!]: Dogs are better than cats. {images: ["/dog1.jpg"]}
    <- [Cats!]: Cats are better than dogs. {images: ["/cat1.jpg"]}
```

For further details, please read the new [guide on adding images](/guide/adding-images.html).

### Creating old-school argument maps and inference trees

This release adds several features that are especially useful for Argdown users that want to visualize the internal inferential structure of complex arguments or prefer the "oldschool" style of argument maps in which every statement is represented by a node in the map:

- With the [`explodeArguments` option](/guide/creating-statement-and-argument-nodes.html#creating-argument-nodes-for-each-inferential-step) every inferential step in a premise-conclusion-structure is automatically put into its own argument (without touching your Argdown source code), so that the internal inferential structure of complex arguments is visualized (especially useful in combination with statementSelectionMode `all`)
- With the new [argumentLabelMode `none`](/guide/changing-the-node-style.html#changing-the-label-mode) argument nodes are visualized without text as small colored circles (if you want you can also do that for statements). This saves space and makes it unnecessary to give each argument a title
- You can now change the Graphviz [node `shape` and `style`](/guide/changing-the-node-style.html#changing-the-node-shape-and-style). In "oldschool" maps argument nodes can be represented by small colored circles, to visualize their role as simple "connectors".

```argdown-map
===
selection:
  statementSelectionMode: all # adds all statements as nodes to the map
model:
  explodeArguments: true # adds argument nodes for each inferential step of each argument
map:
  argumentLabelMode: none # no text in argument nodes
  statementLabelMode: text # no titles in statement nodes
dot:
    argument:
        shape: circle # argument nodes are in the shape of circles
        minWidth: 0.2 # let's make those circles really small
    graphVizSettings:
        rankdir: TB # arrows flow from top to bottom (to produce a tree-like structure)
===

<My complex argument>

(1) This is the first premise.
(2) This is the second premise.
----
(3) This is the first intermediary conclusion.
(4) This is the third premise.
(5) This is the fourth premise.
// statements used in an inferential step can be either defined in the inference's metadata...
--
{uses: [4,5]}
--
(6) This is the second intermediary conclusion
----
// ...or in the conclusion's metadata
(7) This is the main conclusion  {uses: [3,6]}

```

Argdown can now be used to create argument maps in which each inferential step is simply the "connector node" where different premises are linked up. This will also make it easier to switch to Argdown coming from other argument mapping tools that use this "oldschool" approach to visualization.

A [new chapter in the guide](/guide/creating-oldschool-argument-maps-and-inference-trees.html) introduces the optimal configuration for these kinds of maps. You can simply copy & paste the example settings used in this chapter into your own map or configuration file.

### Other new features

- Shareable links for the sandbox: You can now click on "Copy Link" to link directly to your code example in the [Argdown Sandbox](https://argdown.org/sandbox/).
- Custom fonts for pdf export: If you need to use unicode fonts, you can register these fonts with the pdf export (see [#213](https://github.com/christianvoigt/argdown/issues/213) for the details)

### Bug fixes

- argdown-vscode: fixed missing csp error ([216](https://github.com/christianvoigt/argdown/issues/216))
- argdown-vscode: fixed loading of `argdown.config.js` files ([#215](https://github.com/christianvoigt/argdown/issues/215))
- argdown-vscode: improved webpack bundling (in cooperation with @aduh95/viz.js)
- sandbox: fixed sandbox build error ([#208](https://github.com/christianvoigt/argdown/issues/208))
- @argdown/web-components, docs: fixed bug in web-component that led to examples being hidden in syntax docs (if first opened url contained an anchor) ([#206](https://github.com/christianvoigt/argdown/issues/206))
- argdown-vscode: empty line leads to extension host crash ([#195](https://github.com/christianvoigt/argdown/issues/195))
- argdown-vscode: syntax highlighting for bracketed tags ([#192](https://github.com/christianvoigt/argdown/issues/192))
- argdown-core: fixes lexer error when frontmatter yaml data contains equal signs.

As always, all package dependencies have been upgraded.

### Patch releases

#### @argdown/core and @argdown/node v1.7.1

Updated chevrotain to 9.0.0 and updated other dependencies, see [#223](https://github.com/christianvoigt/argdown/issues/223).

### Where are the relase notes for 1.6.x?

While releasing the first packages of 1.6.x I found a way to add images to Viz.Js, which is a feature that has been on the wishlist for many users for a long time. Additionally the bundling up of `argdown-vscode` led to new issues with 1.6.x that had to be fixed anyway. So I decided to stop the release process of 1.6.x and skip to 1.7.x directly.

## Older releases

For the relase notes of 2020 visit [this page](https://argdown.org/changes/2020.html).
