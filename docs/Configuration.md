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

The config file allows you to change the behaviour of the built-in plugins (every feature is implemented using plugins) or even add your own custom plugins and processes!

## Configuring the built-in plug-ins with a config file

Currently you can use the following options (hint: you can try out the effects of some of these in the online [Demo Editor](http://christianvoigt.github.io/argdown) if you use the settings in the sidebar of the map view):

```JavaScript
module.exports = {
  config: {
    inputPath: './*.argdown', // files to be loaded. Use glob syntax (e.g. './**/*.argdown') to load several files at once. you can also directly use argdown input with config.input
    ignoreFiles: [ // by default 'partial' argdown files and folders that start with an underscore are ignored
          '**/_*',        // Exclude files starting with '_'.
          '**/_*/**'  // Exclude entire directories starting with '_'.
      ],
    watch: false, // should the input be continually watched for changes?
    logLevel: 'verbose', // use this if you want to get a lot of log messages from the parser
    process: ['preprocessor', 'parse-input', 'build-model', 'export-html', 'save-as-html', 'export-dot', 'save-as-dot'], //The process that is run if you call `argdown` without any specific command. Just as an example, this will export to html and dot at the same time. If you want to know which processors are available, take a look at the index.js in the argdown-cli repository.
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
      groupColors: ['#DADADA','#BABABA','#AAAAAA'], // groups of level 0 will be colored with groupColors[0]
      graphVizSettings: { //can contain all possible Graphviz graph settings
        rankdir: 'BT', //BT | TB | LR | RL
        concentrate: 'true',
        ratio: 'auto',
        size: '10,10'
      },
      colorNodesByTag: true,
      outputPath: './dot' // path for dot file export
    },
    html: {
      headless: false,
      cssFile: './argdown.css',
      title: 'Argdown Document', // if not set, the first h1 element's content will be taken
      lang: 'en',
      charset: 'utf8',
      head: null, // you can use this to add a custom head section, including doctype and opening html tag
      outputPath: './html' // path for html file export
    },
    json: {
      spaces: 2,
      removeEmbeddedRelations: false,
      exportMap : true,
      exportSections : true,
      outputPath: './json' // path for json file export
    }
  }
}
```

## Adding custom processes

Every time you run an Argdown application, you will execute a process. A process consists of a chain of processors that will each run a number of plugins. Each plugin will be responsible for fulfilling a certain task. For example the `parse-input` process will run the parser plugin. The parser plugin is responsible for parsing Argdown code (for in-depth informations about the structure of an Argdown application visit the Readme of [argdown-parser](https://github.com/christianvoigt/argdown-parser)).

Processes are defined by an array of processors to be run. The built-in commands of argdown-cli also simply execute such processes. For example, here is the process for exporting an Argdown file to html: `['preprocessor', 'parse-input', 'build-model', 'export-html', 'save-as-html']`

Here is how you add a custom process `test-process` to your config file that can be run with `argdown run test-process`:

```Javascript
module.exports = {
  config: {
    processes: {
      "test-process": ['some-processor']
    }
  }
}
```

If you want your custom process to be the default process that is run everytime you call `argdown` without any command, you can use the config.process property:

```Javascript
module.exports = {
  config: {
    process: "test-process",
    processes: {
      "test-process": ['some-processor']
    }
  }
}
```

Currently our custom process will do nothing, as we have not added any plugins to the processor called "some-processor".

The fun begins if we add a custom plugin to the config file.

## Adding custom plugins

A custom plugin can simply be an object with a `name` property and a `run` method. For a more in-depth look at plugins, consult the Readme of [argdown-parser](https://github.com/christianvoigt/argdown-parser). You simply add these plugins to the `config.plugins` array, adding a processor this plugin should be added to:

```Javascript
const testPlugin = {
  name: "TestPlugin", // name of the plugin
  run: function(request, response, logger){ // you can use the response object to get data from previous plugins and to save data for other plugins to use
    logger.log("verbose", "TestPlugin says Hello!");
    response.myCustomData = {thisIsReallyCool: true};
  }
};

module.exports = {
  config: {
    logLevel: "verbose", // set the logLevel to verbose so that we see our plugin in action
    plugins: [{plugin: testPlugin, processor: "some-processor"}], // add the plugin to our custom processor
    processes: {
      "test-process": ["some-processor"] // define the process (in this case it contains only one processor)
    },
    process: "test-process" // define the default process to be run if we call `argdown` without any commands.
  }
}
```

Running `argdown run test-process` will now print `TestPlugin says Hello!` to the console (along with messages about which processors and plugins where run during the process).

A good example for how this mechanism can be used to add new features to `argdown-cli` (or the VS Code extension) is [argdown-png-export](https://github.com/christianvoigt/argdown-png-export).
