# Argdown CLI

A commandline interface to process Argdown data.

For more information about the Argdown argumentation syntax, visit the [Argdown repository](https://github.com/christianvoigt/argdown).

![Argdown](https://cdn.rawgit.com/christianvoigt/argdown-cli/master/argdown-mark.svg)

Current features of argdown-cli:

  - export to html with `argdown html`
  - export to dot  with `argdown dot`
  - export to json with `argdown json`
  - use `argdown` with an `argdown.config.json` file for more complex operations

## Installation

If you have not already done so, please [install node.js and npm](https://docs.npmjs.com/getting-started/installing-node) on your system before installing argdown-cli. To install argdown-cli run the following npm command:

```bash
npm install -g https://github.com/christianvoigt/argdown-cli
```

## Available commands

Available commands:

  - `argdown html [input glob] [output folder]`: exports the input files as html files into the output folder.
  - `argdown dot [input glob] [output folder]`: exports the input files as dot files into the output folder.
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

The config file is a javascript file that exports a config object: 

```JavaScript
module.exports = {
  config: {
    ... your config settings ...
  }
}
```

Currently you can use the following options (hint: you can try out the effects of some of these in the online [Demo Editor](http://christianvoigt.github.io/argdown)):

```JavaScript
module.exports = {
  config: {
    input: './*.argdown',
    ignoreFiles: [ // by default 'partial' argdown files and folders that start with an underscore are ignored
          '**/_*',        // Exclude files starting with '_'.
          '**/_*/**'  // Exclude entire directories starting with '_'.
      ],
    watch: false, // should the input be continually watched for changes?
    verbose: false,
    process: ["build-model", "export-html", "save-as-html", "export-dot", "save-as-dot",], //just as an example, this will export to html and dot at the same time. If a process is defined, the config file can be run without a command (by entering `argdown`)
    model: {
      removeTagsFromText: false // omit all tags in statement texts sand argument descriptions
    },
    tags: [
      {tag: 'my-first-tag', color: '#ff0000'}, // this will overwrite tagColorScheme[0]
      {tag: 'my-second-tag'}, // the color of 'my-second-tag' will be tagColorScheme[1]
    ],
    tagColorScheme: ['#00ff00', '#0000ff'], // if config.tags is not existing, tag colors will be applied in the order of occurrence in the Argdown file, otherwise the order in config tags determines tag colors
    map: {
      statementSelectionMode: 'statement-trees', // options: all | titled | roots | statement-trees | with-relations
      statementLabelMode: 'hide-untitled', // options: hide-untitled | title | description
      argumentLabelMode: 'hide-untitled', // options: hide-untitled | title | text
      excludeDisconnected: true,
      groupDepth: 2,
      addTags: true
    },
    dot: {
      useHtmlLabels : true,
      graphname: 'Argument Map',
      lineLength: 25, // after how many characters should a line break be inserted?
      groupColors: ["#DADADA","#BABABA","#AAAAAA"], // groups of level 0 will be colored with groupColors[0]
      graphVizSettings: { //can contain all possible Graphviz graph settings
        rankdir: 'BT', //BT | TB | LR | RL
        concentrate: 'true',
        ratio: 'auto',
        size: '10,10'
      },
      colorNodesByTag: true      
    },
    html: {
      headless: false,
      cssFile: './argdown.css',
      title: 'Argdown Document', // if not set, the first h1 element's content will be taken
      lang: 'en',
      charset: 'utf8',
      head: null // you can use this to add a custom head section, including doctype and opening html tag 
    },
    json: {
      spaces: 2,
      removeEmbeddedRelations: false,
      exportMap : true,
      exportSections : true
    }
  }
}
```
