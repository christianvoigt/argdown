# @argdown/pandoc-filter

![Argdown logo](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/argdown-arrow.png "Argdown logo")

[Argdown](https://argdown.org) is a simple syntax for analyzing complex argumentation, inspired by Markdown.

This package provides a Pandoc filter that allows to use `argdown-map` code blocks in Markdown files. The code blocks can be transformed into web-components or svg, png, jpg, webp images.

Additionally `argdown` code blocks can be transformed into the web-component with the "source view" activated, providing a simple way to add syntax highlighting. This is only recommended if you export to html and use the web-component anyway.

Otherwise we recommend to use [argdown-pandoc-highlighting](https://github.com/xylomorph/argdown-pandoc-highlighting) for syntax highlighting instead.

Please read the [full documentation](<(https://argdown.org/guide/publishing-argdown-markdown-with-pandoc.html)>) of this package in the Argdown documentation.

## Installation

1. [Install Pandoc](https://pandoc.org/installing.html)
2. Install latex (see Pandoc installation guide)
3. Install rsvg-convert (see Pandoc installation guide)
4. Run `npm install -g @argdown/pandoc-filter`
5. Optionally install the `@argdown/image-export` plugin: `npm install -g @argdown/image-export`

Generate a pdf file from your Argdown-in-Markdown file:

```sh
pandoc -f markdown my-argdown-in-markdown-file.md --filter argdown-filter -o my-pdf-file.pdf
```

Generate a html file from your Argdown-in-Markdown file on **OSX** or **Linux**:

```sh
pandoc -s -f markdown my-argdown-in-markdown-file.md --filter argdown-filter -o my-html-file.html
```

On **Windows 10** you have to use `argdown-filter.cmd` instead:

```sh
pandoc input-file.md -f markdown -t pdf --filter argdown-filter.cmd -o output-file.pdf
```

On **Windows 8.1** using node filters this way currently does not work (see [here](https://github.com/jgm/pandoc/issues/3458) and [here](https://github.com/raghur/mermaid-filter#installation-and-usage)).
