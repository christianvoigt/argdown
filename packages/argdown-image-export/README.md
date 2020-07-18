# @argdown/image-export

![Argdown logo](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/argdown-arrow.png "Argdown logo")

An [Argdown](https://argdown.org) parser plugin for exporting svg argument maps to png, jpg or webp files. The plugin uses [svg-to-img](https://github.com/etienne-martin/svg-to-img) which in turn uses the headless Chrome/Chromium browser [puppeteer](https://github.com/puppeteer/puppeteer). It loads the svg into the browser and makes a snapshot.

Because of puppeteer's large size and [Linux installation requirements](https://developers.google.com/web/tools/puppeteer/troubleshooting#chrome_headless_doesnt_launch_on_unix), this plugin is not part of `@argdown/node` and has to be installed separately.

## Installation and use

Install the package globally:

```sh
npm install -g @argdown/png-export
```

If you are using Linux, you might have to install additional dependencies for Puppeteer. Check the installation notes for [svg-to-img](https://github.com/etienne-martin/svg-to-img) and Google's [troubleshooting document](https://developers.google.com/web/tools/puppeteer/troubleshooting#chrome_headless_doesnt_launch_on_unix) for further information.

`@argdown/cli` and `@argdown/pandoc-filter` will automatically search for the plugin on your computer and use it if needed.

Here is an example of how to use `@argdown/cli` to export a map to png using `@argdown/image-export`:

```sh
argdown map --format png input.argdown output.png
```

## Configuration

Here is an example of how to specify output folders in an `argdown.config.json` file:

```
{
    "png": {
        "outputDir": "./images"
    },
    "jpg": {
        "outputDir": "./images"
    },
    "webp": {
        "outputDir": "./images"
    }
}
```

You can use the following `svg-to-img` [configuration options](https://github.com/etienne-martin/svg-to-img) in an `argdown.config.json` file, by using the `image` config section:

- type is called `format`
- `quality`
- `width`
- `height`
- `background`
- `encoding`

Here is an example:

```
{
    "image": {
        "format": "jpg",
        "encoding": "base64",
        "background": "#ff0000",
        "quality": 0.5,
    }
}
```

The `clip` option is currently not implemented. Say "Hi" on Github, if you need it.
