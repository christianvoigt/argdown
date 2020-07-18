---
title: Using Argdown in Markdown
meta:
  - name: description
    content: How to use Argdown code fences in Markdown
---

# Using Argdown in Markdown

Argdown is not aiming to replace [Markdown](https://commonmark.org/) in your workflow. Argdown is a domain-specific language for argument analysis and reconstruction, not a general markup language for arbitrary content. Many features of Markdown (e.g. tables, images or inline html) will probably never be implemented in Argdown.

This documentation is a good example of how you can combine Markdown and Argdown: The explanatory text is written in Markdown with many Argdown examples in [code fences](/guide/using-argdown-in-markdown.html#argdown-code-fences-in-markdown).

If you want to write a paper about your argument reconstruction or present it on your website, we recommend to do the same. Here are the tools to get you started:

- **Preview**: In VSCode (with the [Argdown VSCode extension](/guide/installing-the-vscode-extension.html) installed) you can directly see the resulting argument maps in VSCode's Markdown preview window while writing.

- **HTML Export**: If you want to export your Argdown-Markdown file to html, you can simply [install the Argdown commandline tool](/guide/installing-the-commandline-tool.html) and use the `argdown markdown [input glob] [output folder]` command. For more advanced use cases we recommend to use Pandoc (see next point).

- **PDF Export:** If you want to export your Argdown-Markdown file to pdf, you can install Pandoc and [use the Argdown Pandoc filter]().

In VSCode you can [define an Argdown task](/guide/running-custom-processes.html#defining-an-argdown-task-in-vs-code) that runs these commands for you.

Finally, using the [Argdown plugins for Markdown parsers](/guide/integrating-argdown-markdown-into-applications.html) you can integrate Argdown support into many static site generators and other applications.

## Argdown code fences in Markdown

You can insert as many Argdown "code snippets" as you want into your Markdown document. To do so, use [fenced code blocks](https://www.markdownguide.org/extended-syntax/#fenced-code-blocks) and add the language identifier `argdown` or `argdown-map` behind the backticks at the beginning of your fenced code block:

- If you preview/export `argdown` code blocks the source code will simply be highlighted
- If you preview/export `argdown-map` code blocks they will be transformed to images of your argument map

## Example

Here is an example of a Markdown document containing Argdown code fences:

````markdown
### Argdown-Markdown example content

Some Markdown text

An image:

![alt text](/argdown-arrow.png "Argdown arrow")

```argdown-map

===
title: my reconstruction
webComponent:
    figureCaption: This will be used as the figure caption instead of the title
===

[s]: a statement
    <- <a>: an argument

<a>

(1) first premise
(2) second premise
-----
(3) conclusion
```

Here comes a Markdown table:

| cell-header 1 | cell-header 2 |
| ------------- | ------------- |
| cell1         | cell2         |

And some inline html:

<button onClick="alert('Yay!');">whatever</button>

Here is another Argdown code block, this time the "source view" of the web-component will be shown:

```argdown

[s]: a statement
    <- <a>: an argument

<a>

(1) first premise
(2) second premise
-----
(3) conclusion
```
````

Let's see how this will look, if you export it to html using the web-component export. The following section is simply the example Markdown from above, exported to html:

### Argdown-Markdown example content

Some Markdown text

An image:

![Argdown arrow](/argdown-arrow.png "Argdown arrow")

```argdown-map

===
title: my reconstruction
webComponent:
    figureCaption: This will be used as the figure caption instead of the title
===

[s]: a statement
    <- <a>: an argument

<a>

(1) first premise
(2) second premise
-----
(3) conclusion
```

Here comes a Markdown table:

| cell-header 1 | cell-header 2 |
| ------------- | ------------- |
| cell1         | cell2         |

And some inline html:

<button onClick="alert('Yay!');">whatever</button>

Here is another Argdown code block, this time the "source view" of the web-component will be shown:

```argdown

[s]: a statement
    <- <a>: an argument

<a>

(1) first premise
(2) second premise
-----
(3) conclusion
```
