# Argdown CLI

![Argdown](https://cdn.rawgit.com/christianvoigt/argdown-cli/master/argdown-mark.svg)

A commandline interface to process Argdown data.

This is still an early alpha version. If you want to try it out use:

```bash
npm install -g https://github.com/christianvoigt/argdown-cli
```

Current features:

  - export to html with `argdown html`
  - export to dot  with `argdown dot`
  - export to graphml with `argdown argml`

If used without input and output arguments these commands will export any .argdown files in the current folder.

Using the `-w` option you can watch your .argdown files for changes and export them instantly.

For more information use the `--help` option.
