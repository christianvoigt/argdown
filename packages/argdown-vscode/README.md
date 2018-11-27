# Argdown for Visual Studio Code

![Argdown logo](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/packages/argdown-vscode/media/argdown-arrow.png?sanitize=true)

[Argdown](https://argdown.org) is a simple syntax for analyzing complex argumentation, inspired by Markdown. This extension provides full language support for Argdown in VS Code:

- [Live Preview](#map-preview) of your argument map
- 2 map layout algorithms ([DagreD3](https://github.com/dagrejs/dagre-d3) & [Viz.js](https://github.com/mdaines/viz.js/))
- [Code completion](#code-completion)
- [Symbol search, outline and breadcrumb support](#document-outline-breadcrumbs-and-symbol-search)
- Quick info (hover)
- Folding ranges
- Jump to/peek at references and definitions
- [Syntax highlighting](#activating-the-argdown-theme)
- Linting (Code Diagnostics)
- [Export to Html, Dot, JSON, SVG, PNG and PDF](#exporting)

If you want to learn more about Argdown argumentation syntax, read the [guide and documentation](https://argdown.org).

## Why the extension was temporarily unpublished

On 2018-11-26 the extension was unpublished on the Marketplace as it was one of the extensions that [inadvertantly depended](https://code.visualstudio.com/blogs/2018/11/26/event-stream) on the open-source library event-stream that was used by hackers to [introduce a "backdoor" vulnerability](https://github.com/dominictarr/event-stream/issues/116). We are not responsible for this hack, nor have we directly used the event-stream library in our code. Instead it was automatically installed by the VS Code yeoman generator for extension authors. As the hack targeted cryptocurrency software, users of this extension were **not** affected by this hack, however Microsoft decided to be cautious and unpublish all extensions using the library. Version 1.0.3 updated the event-stream package and no longer contains the insecure dependency. We are sorry for any inconveniences caused by the temporary unaivailability.


## Working with the extension

VS Code will only load the extension for Argdown documents.

To tell VS Code that your document is an Argdown document, save your document with the `.argdown` or `.ad` filename extension (e.g. `test.argdown`).

## Activating the Argdown theme

![Activating the Argdown theme](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/packages/argdown-vscode/media/ArgdownThemeScreencap.gif?sanitize=true "Activating the Argdown theme")

Standard themes do not highlight Argdown relations and elements. For complete syntax highlighting, please activate the Argdown theme:

1. Go to `Code/Preferences/Color Theme` in the main application menu
2. Select `Argdown Theme` from the list of available themes

The Argdown theme is the default VS Code light theme, enhanced by some Argdown-specific features, so it will also work with other languages.

We hope that VS Code will add support for language-specific themes in the future, so that the Argdown theme will only be active for Argdown files.

## Map Preview

![Map Preview](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/packages/argdown-vscode/media/MapPreviewScreencap.gif?sanitize=true "Opening the map preview")
 
## Code Completion

![Code Completion](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/packages/argdown-vscode/media/CodeCompletionScreencap.gif?sanitize=true "Using code completion")

## Document Outline, Breadcrumbs and Symbol Search

![Document Outline](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/packages/argdown-vscode/media/OutlineScreencap.gif?sanitize=true "Using the document outline")

![Breadcrumbs](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/packages/argdown-vscode/media/BreadcrumbsScreencap.gif?sanitize=true "Using breadcrumbs")

## Exporting

![Export](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/packages/argdown-vscode/media/ExportScreencap.gif?sanitize=true "Exporting Argdown document")
