---
title: Installing the Argdown VS Code Extension
meta:
  - name: description
    content: How to install the Argdown VS Code extension
---

# Installing the VS Code extension

<img src="./argdown-vscode-greenspan-1.png" style="max-width: 600px;"></img>

[Visual Studio Code](https://code.visualstudio.com/) is a great open-source code editor developed by Microsoft. Users can install "extensions" to add support for new programming languages. The VS Code Argdown extension adds support for the Argdown argumentation syntax.

Here are the steps to get you started with VS Code:

1.  Download and install [VS Code](https://code.visualstudio.com/).
2.  Open the **extension gallery** in VS Code to browse through all extensions published in the [VS Code Extension Marketplace](https://code.visualstudio.com/docs/editor/extension-gallery).
3.  Enter `@argdown/vscode` in the search bar of the **extension gallery**. The Argdown extension will appear.
4.  Click on the **install** button in the Argdown extension's entry.
5.  Reload your VS Code window to finish the installation.
6.  Create a new file and save it with the `.argdown` or `.ad` file extension. This will tell VS Code that this file needs Argdown language support and the Argdown extension will be loaded.

## Activating the Argdown theme in VS Code

You need to activate a custom VS Code theme in order to get full support of the Argdown syntax highlighting. To activate the Argdown custom theme, do the following:

1.  Press `CTRL + SHIFT + P` (`CMD + SHIFT + P` on OSX) to open the command palette.
2.  Enter `Preferences: Color Theme` and select the search result.
3.  Enter `Argdown` in the input field and select the Argdown theme.

Now you have added full syntax highlighting support to VS Code. The Argdown custom theme is the default VS Code light theme enhanced by some special colors for things like attack and support relations. So it will work fine with other programming languages as well.

You can also [activate our free ArgVu font](https://github.com/christianvoigt/argdown/tree/master/packages/ArgVu) in VSCode. It comes with Argdown-specific font-ligatures and glyphs.

:::tip Next step
If you are new to Argdown, the next step is to follow along with our [first example](/guide/a-first-example.html).
:::

## Features of the VS Code extension

- Live Preview: watch your argument map grow while you are typing.
- Integration with Markdown: Argdown code fences will automatically be exported to svg argument maps in the Markdown preview
- Code Linter: checks your Argdown code for syntax errors while you are typing.
- Syntax highlighting
- Content assist (Intellisense): Auto code completion and assistance.
- Exports Argdown documents and argument maps to JSON, web component HTML, HTML, DOT, GRAPHML, SVG, PNG and PDF.
- Two hierarchical graph layouts: Dagre or Viz.js

## Further help on using the extension

For further help on using the Argdown extension, please read the extension's README file. You can read it directly in VS Code if you open the "extension gallery" again, search for the "Argdown" extension and click on the search result. This will open the Readme file in VS Code.

You can also find the [Readme](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-vscode/README.md) in the argdown repository.

If you run into any issues while installing or running the extension, you can search for existing issues or post a new issue in the [Argdown repository](https://github.com/christianvoigt/argdown/issues).
