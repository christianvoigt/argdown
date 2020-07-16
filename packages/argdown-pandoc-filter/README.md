# @argdown/pandoc-filter

## Installation

1. [Install Pandoc](https://pandoc.org/installing.html)
2. Install latex (see Pandoc installation guide)
3. Install rsvg-convert (see Pandoc installation guide)
4. Run `npm install -g @argdown/pandoc-filter`

Generate a pdf file from your Argdown-in-Markdown file:

```sh
pandoc -s -f markdown my-argdown-in-markdown-file.md --filter argdown-filter -o my-pdf-file.pdf
```

Generate a html file from your Argdown-in-Markdown file:

```sh
pandoc -s -f markdown my-argdown-in-markdown-file.md --filter argdown-filter -o my-html-file.html
```

## Options

<dl>
<dt>caption</dt><dd>figure caption</dd>
<dt>width</dt><dd>width of the image</dd>
</dl>
