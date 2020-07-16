# @argdown/image-export

An Argdown plugin for exporting svg argument maps to png, jpg or webp files. The plugin uses [svg-to-img](https://github.com/etienne-martin/svg-to-img) which in turn uses the headless Chrome/Chromium browser [puppeteer](https://github.com/puppeteer/puppeteer). It loads the svg into the browser and makes a snapshot.

Because of puppeteer's large size, this plugin is not part of `@argdown/node` and has to be installed separately.

## Installation and use

Install the package globally:

`npm install -g @argdown/png-export`
