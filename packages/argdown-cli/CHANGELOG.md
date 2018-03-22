## 0.9.0

### Breaking Changes

*   Changed config.input to config.inputPath to distinguish between files to load and argdown code input.
*   argdown-cli now uses promises and async/await. It requires at least node version 8.0.0.

### Major Changes

*   Added AsynArgdownApplication to support running plugins asynchronously (using plugin.runAsync).
*   Rewrote SvgToPngExport because of problems with PhantomJS on Linux systems. The plugin now uses Sharp/librsvg for png generation.
*   Changed plugins to use asynchronous runAsync and request/response syntax (using argdown-parser 0.8.0)

## 0.8.0

### Breaking Changes

*   Renamed the `argdown dot` command to `argdown map`

#### Major Changes

*   Png export of Graphviz maps (using PhantomJs)

#### Bug fixes

*   Fixes pdf filenames if input globs are used

## 0.7.0 (02-21-2018)

#### Breaking Changes

*   By default `argdown dot` will now export pdf files. Use `argdown dot --format dot` to export dot files.

#### Major Changes

*   Pdf and svg export of Graphviz maps
*   Error recovery (Linter can now parse multiple errors at once)

#### Minor Changes

*   Upgrade to argdown-parser 0.7.0 and argdown-map-maker 0.3.0
*   Added CHANGELOG.md
