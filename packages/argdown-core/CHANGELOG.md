# @argdown/core

## 1.0.0 (10-16-2018)

### Major changes

* moved to Monorepo, renamed to @argdown/core
* switched to Typescript.
* Rewrote MapPlugin
* Split off StatementSelectionPlugin, ArgumentSelectionPlugin, PreselectionPlugin, RegroupPlugin, GroupPlugin, ColorPlugin
* YAML frontmatter and metadata
* Added a lot of configuration options (selection, grouping, colorizing, customizing nodes)
* Added loose and strict mode for switching between attack/support contrary/entails for s2s relations (#69 Strict mode for entailment and contrary relations)

### Minor changes

* upgraded Chevrotain, made parser compatible with new version

### Bug fixes

* #71 Arg disappears if contradictory instead of contrary relation
* #59 Linter: Argument Syntax
* #64 Syntax error for Argument conclusion produces unhelpful error message.

## 0.8.7 (02-06-2018)

### Minor changes

* added location information to argument descriptions

## 0.8.6 (01-06-2018)

### Minor Changes

* added location information to all rule nodes
* added location information to statements and arguments
* added location information and heading reference to sections (only startLine and startColumn)
* added title for definition and reference nodes

## 0.8.5 (05-28-2018)

### Minor Changes

* lexer performance optimization: added custom token start char hints (see http://sap.github.io/chevrotain/docs/guide/resolving_lexer_errors.html#CUSTOM_OPTIMIZE)
* parser performance optimization: OR caching, see point 3 at http://sap.github.io/chevrotain/docs/FAQ.html#major-performance-benefits
* added tagsDictionary to JSON export.

### Bug fixes

* JSON export includes labelTitle and labelText for map nodes

## 0.8.4 (05-24-2018)

### Bug fixes

* Removed data-line attribute from argument html elements
* fixed line numbers for inferences

### Minor changes

* added has-line class to all html elements with line numbers.

## 0.8.3 (05-16-2018)

### Minor changes

* Parser: Added startLine information for block elements (statements, arguments, relations, list items).
* HTML export: Added data-line attributes for block elements. This will make it possible to sync scrolling in VS Code preview.
* HTML export: added configuration options (will be used in VS Code preview) to change validateLink and normalizeLink behaviour.

### Bug fixes

* Fixed line numbers for relations, argument statements, inferences and list items. The lexer now puts all single line breaks in a special group, instead of skipping them completely. This makes it possible to ignore single line breaks in the parser, but still check the lexing context for line breaks.

## 0.8.2 (05-15-2018)

### Minor changes

* Improved security of HTML Export: link validation
* Added utils for link validation/normalization (copied from Markdown-It)

## 0.8.1 (04-10-2018)

### Minor changes

* Plugins can now use the prepare method to add default settings to the request object before argdownListeners and the run method are called. Plugins no longer have to keep any kind of state (see Readme for details).

### Bug fixes

* Windows line endings in argument reconstructions and list items no longer produce lexer errors.

## 0.8.0 (03-22-2018)

### Breaking Changes

* changed application and plugin structure: app.run(request) expects a request object with an input field, a process array, containing the processors to be run, and configuration options. Plugins now get passed a request and a response object and are expected to add their data to the response and return it.

## 0.7.2 (02-21-2018)

#### Bug fixes

* fixed typo in logAstRecursively

## 0.7.1 (02-21-2018)

#### Bug fixes

* removed occurences of chevrotain.getTokenConstructor

## 0.7.0 (02-21-2018)

#### Major Changes

* Error recovery

#### Minor Changes

* Upgrade to Chevrotain 2.0.2
* Made chevrotain.EOF accessible as ArgdownLexer.EOF
* Added CHANGELOG.md
