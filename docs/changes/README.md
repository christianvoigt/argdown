# Release Notes 2021

## v1.6.x (February 2021)

This is a small release that fixes some bugs and adds two features that are especially useful for Argdown users that want to visualize the internal inferential structure of complex arguments or prefer the "oldschool" style of argument maps in which every statement is represented by a node in the map:

- with the [`explodeArguments` option](/guide/creating-statement-and-argument-nodes.html#creating-argument-nodes-for-each-inferential-step) every inferential step in a premise-conclusion-structure is automatically put into its own argument (without touching your Argdown source code), so that the internal inferential structure of complex arguments is visualized (especially useful in combination with statementSelectionMode `all`)
- with the new [argumentLabelMode `none`](/guide/changing-the-node-style.html#changing-the-label-mode) argument nodes are visualized without text as small colored circles (if you want you can also do that for statements). This saves space and makes it unnecessary to give each argument a title

Argdown can now be used to create argument maps in which each inferential step is simply the "meeting point" where different premises are linked up. This will also make it easier to switch to Argdown coming from other argument mapping tools that use this "oldschool" approach to visualization.

A [new chapter in the guide](/guide/creating-oldschool-argument-maps-and-inference-trees.html) introduces the optimal configuration for these kinds of maps. You can simply copy & paste the example settings used in this chapter into your own map or configuration file.

## Bug fixes

- sandbox: fixed sandbox build error ([#208](https://github.com/christianvoigt/argdown/issues/208))
- @argdown/web-components, docs: fixed bug in web-component that led to examples being hidden in syntax docs (if first opened url contained an anchor) ([#206](https://github.com/christianvoigt/argdown/issues/206))
- argdown-vscode: empty line leads to extension host crash ([#195](https://github.com/christianvoigt/argdown/issues/195))
- argdown-vscode: syntax highlighting for bracketed tags ([#192](https://github.com/christianvoigt/argdown/issues/192))

As always, all package dependencies have been upgraded.

## Older releases

For the relase notes of 2020 visit [this page](https://argdown.org/changes/2020.html).
