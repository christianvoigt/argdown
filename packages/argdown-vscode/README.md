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

## Working with the extension

VS Code will only load the extension for Argdown documents.

To tell VS Code that your document is an Argdown document, save your document with the `.argdown` or `.ad` filename extension (e.g. `test.argdown`).

## Activating Argdown syntax highlighting

Standard themes do not by default highlight Argdown relations and elements. To add complete Argdown syntax highlighting to VSCode you can activate one of the two default themes that are provided by the Argdown extension:

![Activating the Argdown theme](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/packages/argdown-vscode/media/ArgdownThemeScreencap.gif?sanitize=true "Activating the Argdown theme")

1. Go to `File/Preferences/Color Theme` (Windows) or `Code/Preferences/Color Theme` (OSX) in the main application menu
2. Select `Argdown Light` or `Argdown Dark` from the list of available themes

These themes simply extend the default VS Code themes, so they will also work with other languages.

If you prefer to work a different theme, you can also add custom Argdown colors to your VSCode configuration that will work with any theme. Please read the section at the end of this document for further instructions.

## Map Preview

![Map Preview](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/packages/argdown-vscode/media/MapPreviewScreencap.gif?sanitize=true "Opening the map preview")

## Code Completion

![Code Completion](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/packages/argdown-vscode/media/CodeCompletionScreencap.gif?sanitize=true "Using code completion")

## Document Outline, Breadcrumbs and Symbol Search

![Document Outline](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/packages/argdown-vscode/media/OutlineScreencap.gif?sanitize=true "Using the document outline")

![Breadcrumbs](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/packages/argdown-vscode/media/BreadcrumbsScreencap.gif?sanitize=true "Using breadcrumbs")

## Exporting

![Export](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/packages/argdown-vscode/media/ExportScreencap.gif?sanitize=true "Exporting Argdown document")

### Adding custom Argdown colors to your settings

If you prefer to work with other themes, you can add custom colors for Argdown elements to your settings:

1. Go to `File/Preferences/Settings` (Windows) or `Code/Preferences/Settings` (OSX)
2. Enter `colorCustomizations` in the search input field.
3. Click on `edit in settings.json` (this will simply open the file, so it does not really matter that you find the right setting here)

In `settings.json` we have to add the custom colors to the `editor.tokenColorCustomizations` setting as described [here](https://code.visualstudio.com/updates/v1_15#_user-definable-syntax-highlighting-colors). For example, here is how we can change the style of all Argdown attacks:

```json
{
  "editor.tokenColorCustomizations": {
    "textMateRules": [
      {
        "name": "Attack",
        "scope": "markup.list.unordered.attack",
        "settings": {
          "foreground": "#C93504",
          "fontStyle": "bold"
        }
      }
    ]
  }
}
```

You can find the scopes that are used by the Argdown syntax highlighter in the Argdown Light theme. You find the file of the theme [here](https://github.com/christianvoigt/argdown/blob/master/packages/argdown-vscode/themes/argdown-light.json). Simply copy & paste everything from the `tokenColors` array into the `textMateRules` array, change the colors according to your taste and you are good to go.

While you are at it you might also want to adjust the colors in the HTML and map previews. To achieve that you can add an `argdown.config.json` file in your workspace folder and use the `color` configuration options. Please consult the Argdown documentation for further details.
