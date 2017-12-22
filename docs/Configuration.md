# Configuring the Argdown parser with argdown.config.js files

The VS Code extension and the commandline interface both support configuring the Argdown parser by using config files. By default config files are named `argdown.config.js`. The VS Code extension will look for config files in your workspace folders. The argdown-cli tool will look for config files in the folder it is executed.

The config file is a javascript file that exports a config object: 

```JavaScript
module.exports = {
  config: {
    ... your config settings ...
  }
}
```

Currently you can use the following options (hint: you can try out the effects of some of these in the online [Demo Editor](http://christianvoigt.github.io/argdown) if you use the settings in the sidebar of the map view):

```JavaScript
module.exports = {
  config: {
    input: './*.argdown',
    ignoreFiles: [ // by default 'partial' argdown files and folders that start with an underscore are ignored
          '**/_*',        // Exclude files starting with '_'.
          '**/_*/**'  // Exclude entire directories starting with '_'.
      ],
    watch: false, // should the input be continually watched for changes?
    logLevel: "verbose", // use this if you want to get a lot of log messages from the parser
    process: ["preprocessor", "parse-input", "build-model", "export-html", "save-as-html", "export-dot", "save-as-dot"], //just as an example, this will export to html and dot at the same time. If a process is defined, the config file can be run without a command (by entering `argdown`). If you want to know which processors are available, take a look at the index.js in the argdown-cli repository.
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