# @argdown/node

![Argdown logo](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/argdown-arrow.png "Argdown logo")

This package consists of classes specific for running Argdown applications in Node.js:

- The package contains the AsynArgdownApplication subclass supporting asynchronous plugin methods.
- It instantiates this class with all plugins and processes preconfigured and predefined so that you can use it directly without any additional setup.
- It provides plugins that are specific to Argdown applications that are running in Node.js and not in the browser, for example the LoadFilePlugin and the SaveAsPlugin.

The package is used in @argdown/cli and @argdown/vscode.

This package is part of the [Argdown project](https://argdown.org).

For more information about this package visit the [API documents](https://argdown.org/argdown-node/index.html).

## Installing

If you want to use the package in your own software, use `npm install @argdown/node`.

If you want to check out the code, fork this repository and run `npm run bootstrap`.

## Testing

`npm run test`

## Building

`npm run build`
