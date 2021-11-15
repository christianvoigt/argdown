# Publishing Argdown-Markdown with Pandoc

[Pandoc](https://pandoc.org/) is a popular "document converter" that can be used to export Markdown files into pdf, latex, html or many other formats.

You can add Argdown support to Pandoc by installing the `@argdown/pandoc-filter`. This will create a powerful tool for publishing argument maps in pdf documents or html pages.

The filter can export your argument maps as svg, png, jpg or webp images and has [many configuration options]().

### Installation

The Pandoc installation process is less complex than it might look and is definitely worth it, so let's get started:

1. [Install Pandoc](https://pandoc.org/installing.html)
2. [Install LaTeX and rsvg-convert](https://pandoc.org/installing.html) (both will be needed by Pandoc).
3. If you have not already done so, install [node and npm](https://nodejs.org/en/download/).

Next, let's add Argdown support by installing the `@argdown/pandoc-filter`:

```sh
npm install -g @argdown/pandoc-filter
```

If you want to convert your argument maps to pixel images (instead of svgs), install `@argdown/image-export` with:

```sh
npm install -g @argdown/image-export
```

:::tip
If you run this on Linux, check out the plugin's [README](https://github.com/christianvoigt/argdown/tree/master/packages/argdown-image-export) for how to install additional dependencies.
:::

The pandoc filter will automatically look for the image export plugin on your computer and use it as needed.

If you want to add Argdown syntax highlighting to Pandoc, download the files from Sebastian Cacean's nice [argdown-pandoc-highlighting](https://github.com/xylomorph/argdown-pandoc-highlighting) and use them according to the instructions there. Alternatively you can also use the web-component export for this purpose as [explained further below](/guide/publishing-argdown-markdown-with-pandoc.html#highlighting-the-syntax-in-argdown-code-blocks).

### Exporting Argdown-Markdown to PDF or HTML

Let's say we have a Argdown-Markdown file called `input-file.md` with the following content:

````markdown
This is _Markdown_ code. Here comes an _Argdown_ code block:

```argdown-map
[s1]: text
    <- <a1>: text
```
````

To export `input-file.md` to a PDF document named `output-file.pdf`, run the following command on OSX or Linux:

```sh
pandoc input-file.md -f markdown -t pdf --filter argdown-filter -o output-file.pdf
```

On **Windows 10** you have to use `argdown-filter.cmd` instead:

```sh
pandoc input-file.md -f markdown -t pdf --filter argdown-filter.cmd -o output-file.pdf
```

On **Windows 8.1** using node filters this way currently does not work (see [here](https://github.com/jgm/pandoc/issues/3458) and [here](https://github.com/raghur/mermaid-filter#installation-and-usage)).

To export `input-file.md` to a HTML document named `output-file.html`, run the following command on OSX or Linux:

```sh
pandoc input-file.md -f markdown -t html -s --filter argdown-filter -o output-file.html
```

On Windows use `--filter argdown-filter.cmd`.

Consult the [Pandoc documentation](https://pandoc.org/MANUAL.html) for further information on the general use of Pandoc.

## Configuring the Argdown filter

By default the Argdown filter will export `argdown-map` code blocks as **svg inline images** that will not be saved separately from the exported main document.

Here is how to export `argdown-map` code blocks as external _png image files_ instead (will only work if you have installed `@argdown/image-export`):

````markdown
---
argdown:
  mode: "file"
  format: "png"
---

This is _Markdown_ code. Here comes an _Argdown_ code block:

```argdown-map
[s1]: text
    <- <a1>: text
```
````

We are using a Markdown YAML metadata section to configure the Argdown filter, setting the `mode` and `format` properties. The configuration will be applied to all exports of `argdown-map` code blocks.

You can also add different configurations for different code blocks by using the following syntax:

````markdown
Here comes the first one:

```{.argdown #fig:first-map caption="First map"}
[s1]
    <- <a1>
```

And here is the second one:

```{.argdown #fig:second-map caption="Second map"}
[s1]
    <- <a1>
```

And here we refer to @fig:first-map and @fig:second-map in Markdown.
````

Here we are defining figure captions and ids for the two maps. Using [pandoc-crossfref](https://github.com/lierdakil/pandoc-crossref) we can then later refer to these figures elsewhere in the document (as shown above).

Using the `{.argdown-map configOption=configValue}` syntax, _all_ configuration options of the Argdown filter can be applied separately for each `argdown-map` code block.

:::warning
The downside of using code block meta data is that the VSCode Markdown preview does not recognize this pandoc-specific format and Argdown code blocks will not be transformed to web-components.
:::

### Using `argdown.config.json` files

Here is how you can instruct the Argdown filter to use a `argdown.config.json` file for further configuration of the Argdown parser:

````markdown
---
argdown:
  config: "some-folder/argdown.config.json"
  mode: "web-component"
---

```argdown-map
===
webComponent:
    withoutHeader: true
===

[s1]
    <- <a1>
```

You can also use a different config file for specific code blocks:

```{.argdown-map config="some-other-folder/some-other-name.config.json"}
[s1]
    <+ <a2>
```
````

In this example the first Argdown code block will be exported using the Argdown config file defined in the Markdown metadata _and_ the additional configuration defined in the YAML frontmatter section of the code block.

The second code block will be exported by using the second config file _defined in the code block's meta data_.

:::warning
Note that in this example the file paths are _relative to the directory where you run pandoc_ (the "current working directory"), so be careful to always run it from the same directory or the config files will not be found.
:::

## Export modes and formats

Use the `mode` configuration property to choose one of the following export modes:

- `inline`: inline image (default)
- `file`: external image
- `web-component`: web-component html (only recommended if you export to html)

Use the `format` configuration property to choose one of the following image formats (only used if the mode is not `web-component`):

- `svg`
- `png`
- `jpg`
- `webp`

The latter three are only supported if you install the [`@argdown/image-export`](https://github.com/christianvoigt/argdown/tree/master/packages/argdown-image-export) plugin (see installation instructions).

If you use the `file` mode, the Argdown parser will automatically name the exported image files (either by calling them `map-1`, `map-2`, ... or by using the figure id defined with `#fig:some-id`).

## Image width and height

You can set the image `width` and `height` in the code block's metadata:

````markdown
```{.argdown-map width=800}
[s1]
    <- <a1>
```
````

## Highlighting the syntax in `argdown` code blocks

By default `argdown` code blocks are ignored by the Argdown filter. Only `argdown-map` code blocks are exported. This makes it possible to use the official Pandoc syntax highlighting (see [argdown-pandoc-highlighting](https://github.com/xylomorph/argdown-pandoc-highlighting)) for `argdown` code blocks.

If you want to use the Argdown filter for this purpose, you can export `argdown` code blocks as web-component html, using its "source view" for syntax highlighting. This makes sense if you want to export to HTML and already use the web-component for `argdown-map` code blocks.

Here is how you use the web-component to highlight `argdown` code blocks:

````markdown
---
argdown:
  sourceHighlighter: web-component
  mode: web-component
---

```argdown
===
webComponent:
    withoutHeader: true
    views:
        source: true
        map: false
===

[s1]
    <- <a1>
```
````

In this example we are also configuring the web-component export in the YAML frontmatter section so that the web-component is exported without the map view and without the header (containing logo and buttons). Of course you could also add this configuration to an `argdown.config.json` file and use the `config` option to point to this file (see above).

## Creating slide-shows with Pandoc

You can also use Pandoc to create a [slide show](https://pandoc.org/MANUAL.html#slide-shows) for a presentation. Here is an example of how to create a html slide show using Pandoc and [Reveal.js](https://revealjs.com/):

````markdown
---
title: my presentation
author: Christian Voigt
argdown:
  sourceHighlighter: web-component
  mode: web-component
---

# First slide

The Argdown source:

<!-- you might have to customize the Reveal js css styles for this to look good -->

```argdown
===
webComponent:
    withoutHeader: true
    views:
        source: true
        map: false
sourceHighlighter:
    removeFrontMatter: true
===

[s1]
    <- <a1>
```

# Second slide

The map:

```argdown-map
[s1]
    <- <a1>
```

---

## The third slide

## You can also create new slides by using `---`

Here is the fourth slide
````

You can generate your HTML slides with the following command:

```sh
pandoc -s --webtex -i -t revealjs ./my-slide.show.md  -V theme=black --filter argdown-filter.cmd -o slides.html
```

[Here](https://github.com/jgm/pandoc/wiki/Using-pandoc-to-produce-reveal.js-slides) you can read more about using Pandoc to generate Reveal.js slides.
