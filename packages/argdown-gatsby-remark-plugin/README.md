# @argdown/gatsby-remark-plugin

![Argdown logo](https://raw.githubusercontent.com/christianvoigt/argdown/HEAD/argdown-arrow.png "Argdown logo")

This package is part of the [Argdown project](https://argdown.org) and adds Argdown support to Gatsby.

For a more detailed documentation, read the guide on [how to use Argdown in Markdown](https://argdown.org/guide/using-argdown-in-markdown.html).

## Installation

```bash
yarn add @argdown/gatsby-remark-plugin
```

## Setup

[`gatsby-plugin-mdx`](https://www.gatsbyjs.org/docs/mdx/plugins/#remark-plugins)

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-mdx",
      options: {
        gatsbyRemarkPlugins: [
          {
            resolve: "@argdown/gatsby-remark-plugin",
            options: {
              argdownConfig: {
                webComponent: {
                  withoutHeader: true
                }
              }
            }
          }
        ]
      }
    }
  ]
};
```

[`gatsby-transformer-remark`](https://www.gatsbyjs.org/packages/gatsby-transformer-remark)

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "@argdown/gatsby-remark-plugin",
            options: {
              argdownConfig: {
                webComponent: {
                  withoutHeader: true
                }
              }
            }
          }
        ]
      }
    }
  ]
};
```
