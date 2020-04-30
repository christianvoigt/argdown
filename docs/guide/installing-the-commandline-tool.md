---
title: Installing the Argdown commandline tool
meta:
  - name: description
    content: How to install the Argdown commandline tool
---

# Installing the commandline-tool

The Argdown commandline tool is a Node.js program and distributed as a npm package. To install it you first have to install Node.js:

1.  [Download Node.js](https://nodejs.org/en/) and install it manually or use a [package manager](https://nodejs.org/en/download/package-manager/) to install it. You need at least Node 8.0.0, so if you already have node installed, please check its version ('node --version') and update it if needed. Npm is node's package manager and comes already installed with Node.js so you can now use it.
2.  Run `npm install -g @argdown/cli` to install the comandline tool globally.
3.  You can now run `argdown --help` in the commandline to get further help on using the commandline tool. The tool consists of several commands for exporting Argdown documents into other document formats. For example `argdown map` will export any Argdown files in the current directory as svg files that are saved in the "svg" folder. You can get help for the options of each command by using the `--help` parameter. For example, enter `argdown map --help` to see all options of the `map` command.

Now you can edit Argdown in the editor of your choice. You might want to install our free [ArgVu](https://github.com/christianvoigt/argdown/tree/master/packages/ArgVu) font. It comes with Argdown-specific font-ligatures and glyphs.

:::tip Next step
If you are new to Argdown, the next step is to follow along with our [first example](/guide/a-first-example.html).
:::

## Features of the commandline tool

- Exports Argdown documents and argument maps to JSON, web component HTML, HTML, DOT, GRAPHML, SVG, PNG or PDF.
- Code linting: Prints syntax error with location information
- You can watch whole folders and automatically execute a command if any Argdown file has changed.
- Extensive configuration options through `argdown.config.json` or `argdown.config.js` files.
- Can be extended by custom plugins added in a `argdown.config.js` file.

## Further help on using the commandline tool

Please read the [README](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-cli/Readme.md) of the commandline tool for further information.

If you run into any issues while installing or running the commandline tool, you can search for existing issues or post a new issue in the [Argdown repository](https://github.com/christianvoigt/argdown/issues).
