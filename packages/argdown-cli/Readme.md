# Argdown CLI

A commandline interface to process Argdown data.

For more information about the Argdown argumentation syntax, visit the [Argdown repository](https://github.com/christianvoigt/argdown).

![Argdown](https://cdn.rawgit.com/christianvoigt/argdown-cli/master/argdown-mark.svg)

Current features of argdown-cli:

  - export to html with `argdown html`
  - export to pdf, svg or dot  with `argdown dot`
  - export to json with `argdown json`
  - use `argdown` with an `argdown.config.json` file for more complex operations

## Installation

If you have not already done so, please [install node.js and npm](https://docs.npmjs.com/getting-started/installing-node) on your system before installing argdown-cli. To install argdown-cli run the following npm command:

```bash
npm install -g argdown-cli
```

## Available commands

Available commands:

  - `argdown html [input glob] [output folder]`: exports the input files as html files into the output folder.
  - `argdown dot [input glob] [output folder]`: exports argument maps layouted with Graphviz. By default the maps are saved as pdf files. Use `--format svg` to save svg files and `--format dot` to save dot files.
  - `argdown json [input glob] [output folder]`: exports the input files as .json files into the output folder.
  - `argdown compile [input glob] [output folder]`: compiles the input files with included files into new .argdown files.
  
All commands can be used with the `-w` option: The cli will then watch your .argdown files continuously for changes and export them instantly.

The input files can specified with wildcards if they are put in quotes (e.g. `argdown html './**/*.argdown'`).

If used without input and output arguments these commands will export any .argdown files in the current folder.

For more information use the `--help` option with each command.

## Includes

You can include 'partial' Argdown files in other Argdown files by using the following syntax:

````
Some Argdown content ...

@include(_my-argdown-partial.argdown)

Some more Argdown content ...
````

This will even work recursively as long as you don't try to include an Argdown file that has already been included before.

Argdown-Cli will then compile the different Argdown files into one before starting the parsing process. You can also save the result of this compilation by using the `argdown compile` command.

## Partials

You can include any Argdown file in another Argdown file. However, it is recommended to only include 'partials' in other files. An Argdown file is treated as a partial if its name starts with an underscore. Except in @import statements partials are ignored by argdown-cli. 

This naming convention makes it possible to have a main .argdown file and several partials in the same folder without having to specify which files should be processed or ignored by the commands of argdown-cli.

## Config options

The cli can be configured with a config file. It will automatically look for a `argdown.config.js`. If you want to use a different name you can use `argdown --config [name-of-my-config-file].js`.

[Visit the config documentation](https://github.com/christianvoigt/argdown/tree/master/docs/Configuration.md) at the central Argdown repository to learn more about the format of the config file.