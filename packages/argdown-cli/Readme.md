# Argdown CLI

![Argdown](https://cdn.rawgit.com/christianvoigt/argdown-cli/master/argdown-mark.svg)

A commandline interface to process Argdown data.

For more information about the Argdown argumentation syntax, visit the [Argdown repository](https://github.com/christianvoigt/argdown).

Current features of argdown-cli:

  - export to html with `argdown html`
  - export to dot  with `argdown dot`
  - export to graphml with `argdown argml`

## Installation

If you have not already done so, please [install node.js and npm](https://docs.npmjs.com/getting-started/installing-node) on your system before installing argdown-cli. To install argdown-cli run the following npm command:

```bash
npm install -g https://github.com/christianvoigt/argdown-cli
```

## Documentation

Available commands:

  - `argdown html [input files] [output folder]`: exports the input files as html files into the output folder.
  - `argdown dot [input files] [output folder]`: exports the input files as dot files into the output folder.
  - `argdown argml [input files] [output folder]`: exports the input files as .graphml files into the output folder.
  
All commands can be used with the `-w` option: The cli will then watch your .argdown files continuously for changes and export them instantly.

The input files can specified with wildcards (e.g. './**/*.argdown').

If used without input and output arguments these commands will export any .argdown files in the current folder.

For more information use the `--help` option with each command.
