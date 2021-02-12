---
title: Embedding your Argdown maps in a Webpage
meta:
  - name: description
    content: How to export Argdown argument maps as web components that can easily be inserted into any webpage
---

# Embedding your Argdown maps in a Webpage

Using the **Argdown web-component** you can embed zoomable svg argument maps into your webpage. This is what it will look like:

```argdown-map
===
title: how the web component looks like
===

[s]: statement
  - <a>: argument
```

This section will describe

- how to create the web component
- how to load the files in your webpage that are required for the web component
- how to configure the Argdown web component
- how to manually replace the Viz.js map with a Dagre map or a GraphML map that was edited in yEd.

## How to generate the Argdown web-component HTML

There are four ways how you can create a HTML page containing the web component:

- The easiest way is to use the **web component export** of the VSCode extension or the commandline tool (using the `argdown web-component [inputGlob] [outputFolder]` command). Using the export in the VSCode extension for your Argdown file the generated html will be copied to the clipboard so that you can simply paste the web-component into any html page.
- You can also use the **Markdown export** of the commandline tool, if you want to write your whole webpage in Markdown using [fenced Argdown code blocks](/guide/using-argdown-in-markdown.html) and export it with the `argdown markdown [inputGlob] [outputFolder]` command to html.
- If you need more configuration options, use **Pandoc** with the [Argdown filter](/guide/publishing-argdown-markdown-with-pandoc.html) and export your file to html.
- Finally, you can use the same approach with a **static site generator** (like [Gatsby](https://www.gatsbyjs.org/), [Eleventy](https://www.11ty.dev/), [Vuepress](https://vuepress.vuejs.org/)). As long as it uses `remark`, `markdown-it` or `marked` as its Markdown parser you can [add Argdown support](/guide/integrating-argdown-markdown-into-applications) to the generator.

## How to load the required files

By default, the web-component exporter and the Markdown parser plugins automatically include script and style tags to the generated HTML to load the web-component's dependencies.

However, we recommend to adjust the settings so that these files are loaded from your own webspace. By default, the files are loaded from [jsdelivr](https://cdn.jsdelivr.net/npm/@argdown/web-components/). We recommend that you download and save the files from there and change the urls to point to them.

The following files are needed to get the web-component fully working:

- [argdown-map.js](https://cdn.jsdelivr.net/npm/@argdown/web-components/dist/argdown-map.js): A Javascript file that defines the web-component
- [argdown-map.css](<(https://cdn.jsdelivr.net/npm/@argdown/web-components/dist/argdown-map.css)>): The styles for the highlighted source and the web-component before the script is loaded (avoiding [FOUC](https://de.wikipedia.org/wiki/Flash_of_Unstyled_Content))
- Optionally the [web-component polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs), if you need to support older browsers. You can also download it from [jsDelivr](https://www.jsdelivr.com/package/npm/@webcomponents/webcomponentsjs)

You can also use npm to get the files:

```sh
npm install @argdown/web-components
```

You will find the files in `node_modules/@argdown/web-components/dist` folder.

Once you have your own copies of the files you have to point the Argdown parser to them, by using an [Argdown config file](/guide/configuration-with-config-files.html) or by directly configuring Argdown when [setting up the Argdown plugins for your Markdown parser]().

In the following example we use an `argdown.config.json` file to tell the Argdown parser that the web-component files should be loaded from the root folder of your webpage:

```json
{
  "webComponent": {
    "webComponentScriptUrl": "/argdown-map.js",
    "globalStylesUrl": "/argdown-map.css",
    "webComponentPolyfillUrl": "/webcomponents-bundle.js"
  }
}
```

The Markdown parser plugins will load these files once at the top of the generated HTML, even if it contains many Argdown web components. If you export the web components manually from different Argdown files, the files are loaded each time at the beginning of the generated web component HTML. If you use several components on the same page, you should avoid loading the same files over and over again.

For that purpose you can deactivate this behaviour in your Argdown configuration:

```json
{
  "webComponent": {
    "addWebComponentScript": false,
    "addGlobalStyles": false,
    "addWebComponentPolyfill": false
  }
}
```

If you deactivate this behaviour you have to manually load the required files in your webpage (for example in the head section of your html page).

## How to configure the web component

The web-component export plugin can be configured in the Frontmatter section or a config file, using the `webComponent` configuration property. It can also be styled with css like any other HTML element.

### Styling the component

The Argdown web component can be styled with custom css. If you want to change the colors of the web component's user interface, you can use the following css variables:

```css
html {
  --argdown-bg-color: #fff;
  --argdown-border-color: #eee;
  --argdown-logo-color: #ccc;
  --argdown-button-bg-color: #3e8eaf;
  --argdown-button-bg-hover-color: #387e9c;
  --argdown-button-border-bottom-color: #38809d;
  --argdown-button-font-color: #fff;
}
```

By default the web component is wrapped in a `figure` html element that determines the size of the component. The default styles display it with a grey border and rounded corners. The figure element has the class `argdown-figure`. Here is how you remove the border:

```css
figure.argdown-figure {
  border: 0;
}
```

If you remove the figure element (see below), you should style the `argdown-map` html element directly:

```css
argdown-map {
  border: 0;
  width: 100%;
  max-width: 30rem;
  max-height: 30rem;
}
```

If you want to change the colors of the highlighted Argdown code, simply copy & paste the styles in the `argdown-map.css` to your own css file and make your changes.

### Changing the size of an instance

Using css you can change the size of all your Argdown web components on your page at once. If you want to use different sizes for specific instances, you can use the `width` and `height` css properties of the `webComponent` configuration:

```argdown
===
webComponent:
  width: 200px
  height: 200px
===

[s]
  - <a>
```

By default the width is set to `100%` and the height is set to `auto` and is applied to the `figure.argdown-figure` element. If you remove the figure element, the styles are applied to the `argdown-map` element instead.

### Using the ArgVu font for the source view

Here is how you activate the [ArgVu font](https://github.com/christianvoigt/argdown/tree/master/packages/ArgVu) for the source view:

```argdown
===
webComponent:
  useArgVu: true
===

[s]
  <- <a>
```

In this case the font styles for the components will change and the ArgVu font ligatures will be activated.

:::tip

Because the ArgVu font is not loaded by the css of this webpage, the source view in the example above will only use ArgVu if you have installed it on your computer.

If you want to use this feature, you should load the [ArgVu](https://github.com/christianvoigt/argdown/tree/master/packages/ArgVu) font file [in your css](https://stackoverflow.com/questions/107936/how-to-add-some-non-standard-font-to-a-website) so that it is also used for users who have not installed it.

:::

### The figure caption

By default, the exporter will use the document's title, subtitle and abstract to generate a figure caption if they are defined.

```argdown
===
title: I will be used as figure caption
subTitle: me too
abstract: me too
===

[s]
  - <a>
```

You can override this behavior by explicitely defining a figure caption:

```argdown
===
title: Document title that will be overriden
webComponent:
  figureCaption: Some Caption
===

[s]
  - <a>
```

### Removing the figure element

By default, the Argdown web component is wrapped in a figure element with a figure caption.

Here is how your remove this additional markup:

```argdown
===
webComponent:
  withoutFigure: true
===

[s]
  - <a>
```

### Set the initial view

Currently the web-component has a "source" and a "map" view. By default the "map" view is shown first (if you use Argdown in Markdown, `argdown` code blocks show the "source" view, `argdown-map` code blocks show the "map" view first).

You can explicitely set the initial view:

```argdown
===
webComponent:
  initialView: source
===

[s]
  - <a>
```

### Remove a view

You might want to remove the "source" or "map" view from the component. Here is how you remove the "map" view:

```argdown-map
===
webComponent:
  initialView: source,
  views: {
    source: true,
    map: false
  }
===

[s]
  - <a>
```

### Remove the frontmatter in the source view

The original source:

```
===
sourceHighlighter:
  removeFrontMatter: true
===

[s]
  - <a>
```

In the web component this source will be inserted without the frontmatter:

```argdown
===
sourceHighlighter:
  removeFrontMatter: true
===

[s]
  - <a>
```

Even though the frontmatter is not displayed in the source view, its settings will still be applied during the generation of the web component.

### Hide the Argdown logo

You can hide the web component's Argdown logo if you like. In that case we would appreciate it, if you would help Argdown getting more publicity in some other way (for example by adding a footnote to your paper).

```argdown
===
webComponent:
  withoutLogo: true
===

[s]
  - <a>
```

### Disable the zoom feature

```argdown-map
===
webComponent:
  withoutZoom: true
===

[s]
  - <a>
```

### Disable the maximize feature

```argdown
===
webComponent:
  withoutMaximize: true
===

[s]
  - <a>
```

### Hiding the header completely

To hide the header completely use the following setting:

```yaml
webComponent:
  withoutHeader: true
```

This is especially useful if you want to print the HTML page. If you use this feature and hide the Argdown logo, we would appreciate it, if you would help Argdown getting more publicity in some other way (for example by adding a footnote to your paper).

```argdown
===
webComponent:
  withoutHeader: true
===

[s]
  - <a>
```

## Using a GraphML or Dagre map with the web component

Currently the web component export will always use the Viz.js (Graphviz) map export. If you prefer the Dagre map or have exported your map to GraphML and then edited it manually in yEd, you can still use the web component, if you are willing to change it manually.

The "source" and "map" views of the Argdown web component are child html elements of it, assigned to the "source" and "map" slots of the component. You have complete control over these elements. The component does not care what kind of source code or svg you put into these slots, as long as the following HTML structure of the component is maintained:

```html
<argdown-map initial-view="map">
  <div slot="source">
    <pre class="language-argdown">
      <code class="language-argdown">
        <!-- Your source code content -->
      </code>
    </pre>
  </div>
  <div slot="map">
    <svg width="..." height="..." viewBox="...">
      <!-- Your svg content -->
    </svg>
  </div>
</argdown-map>
```

If you want to switch from a Viz.js map to a Dagre map or a yEd map, delete the svg element in the `slot="map"` div and copy & paste the svg generated by Dagre or yEd into it.
