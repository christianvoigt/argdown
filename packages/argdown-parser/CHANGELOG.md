## 0.8.2 (05-15-2018)

### Minor changes

* Improved security of HTML Export: link validation
* Added utils for link validation/normalization (copied from Markdown-It)

## 0.8.1 (04-10-2018)

### Minor changes

*   Plugins can now use the prepare method to add default settings to the request object before argdownListeners and the run method are called. Plugins no longer have to keep any kind of state (see Readme for details).

### Bug fixes

*   Windows line endings in argument reconstructions and list items no longer produce lexer errors.

## 0.8.0 (03-22-2018)

### Breaking Changes

*   changed application and plugin structure: app.run(request) expects a request object with an input field, a process array, containing the processors to be run, and configuration options. Plugins now get passed a request and a response object and are expected to add their data to the response and return it.

## 0.7.2 (02-21-2018)

#### Bug fixes

*   fixed typo in logAstRecursively

## 0.7.1 (02-21-2018)

#### Bug fixes

*   removed occurences of chevrotain.getTokenConstructor

## 0.7.0 (02-21-2018)

#### Major Changes

*   Error recovery

#### Minor Changes

*   Upgrade to Chevrotain 2.0.2
*   Made chevrotain.EOF accessible as ArgdownLexer.EOF
*   Added CHANGELOG.md
