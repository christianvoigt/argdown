# @argdown/map-views

![Argdown logo](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/argdown-arrow.png "Argdown logo")

This package is part of the [Argdown project](https://argdown.org). It contains the two Argdown map views used in @argdown/vscode and @argdown/sandbox:

- DagreMap uses dagre-d3 to generate SVG from Argdown data
- VizJsMap uses viz.js to generate SVG from Argdown data (via the dot format)

Both views use the browser DOM and can not be used in a pure node.js project.

Both map views use d3 to add move & zoom interaction to the graphs. These features are implemented in the ZoomManager class.

VizJsMap uses the web worker functionality of viz.js so you have to provide it with a working url to the `full.render.js` script of the viz.js package.

To find out how to use these views, take a look at the example provided with this package. It can be build with `npm run example`. The example uses the parcel bundler to bundle up the different npm packages and compile the typescript files. It also shows how to use the `full.render.js` of viz.js as a web worker.

To build this package use `npm run build`.
