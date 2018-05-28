## 0.11.4

* Upgraded to argdown-map-maker 0.5.1

## 0.11.4

* Upgraded to argdown-parser 0.8.5

## 0.11.3

### Minor Changes

* Upgraded to argdown-parser 0.8.4
* Added config option for custom logger

## 0.11.2

### Minor Changes

 * Updated to argdown-parser 0.8.3

## 0.11.1

### Minor Changes

* Package exports utils for link validation/normalization

### Bug fixes

* Removed sharp as (unused) dependency

## 0.11.0

### Breaking Changes

* Removed SvgToPngExport from argdown-cli. The plugin used the sharp image library which caused installation problems for some operating systems and in the VS Code extension (see https://github.com/christianvoigt/argdown/issues/47). The plugin can now be found at [argdown-png-export](https://github.com/christianvoigt/argdown-png-export) and can be added to argdown-cli using the new features of argdown.config.js

### Major Changes

* Added ability to run custom processes, defined in argdown.config.js
* Added ability to add custom plugins to argdown-cli using argdown.config.js

## 0.10.0

### Minor Changes

* Moved DotToSvgExportPlugin into this repository to keep file size of argdown-map-maker small (useful for web projects like the online editor)

## 0.9.1

### Minor Changes

* Updated to argdown-parser 0.8.1 and argdown-map-maker 0.4.1 (see their Changelog for info about the new bug fixes)
* Added support for plugin's prepare method in app.runAsync
* Implemented new configuration pattern for plugins (for details see Readme of argdown-parser)

## 0.9.0

### Breaking Changes

* Changed config.input to config.inputPath to distinguish between files to load and argdown code input.
* argdown-cli now uses promises and async/await. It requires at least node version 8.0.0.

### Major Changes

* Added AsynArgdownApplication to support running plugins asynchronously (using plugin.runAsync).
* Rewrote SvgToPngExport because of problems with PhantomJS on Linux systems. The plugin now uses Sharp/librsvg for png generation.
* Changed plugins to use asynchronous runAsync and request/response syntax (using argdown-parser 0.8.0)

## 0.8.0

### Breaking Changes

* Renamed the `argdown dot` command to `argdown map`

#### Major Changes

* Png export of Graphviz maps (using PhantomJs)

#### Bug fixes

* Fixes pdf filenames if input globs are used

## 0.7.0 (02-21-2018)

#### Breaking Changes

* By default `argdown dot` will now export pdf files. Use `argdown dot --format dot` to export dot files.

#### Major Changes

* Pdf and svg export of Graphviz maps
* Error recovery (Linter can now parse multiple errors at once)

#### Minor Changes

* Upgrade to argdown-parser 0.7.0 and argdown-map-maker 0.3.0
* Added CHANGELOG.md
