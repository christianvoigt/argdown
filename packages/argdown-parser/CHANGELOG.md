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
