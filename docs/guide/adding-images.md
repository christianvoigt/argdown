---
title: Adding images
meta:
  - name: description
    content: How to add images to argument and statement nodes.
---

# Adding images

Images can serve different functions in your map:

- icons can visualize different categories of statements or arguments (similar to using colors)
- let a node stand out and make it instantly recognizable
- liven up the look of your map a little

At the moment, images are only supported for the Viz.js maps, not for Dagre or GraphML maps.

To add an image, you first have to tell Argdown the dimensions and file path in the frontmatter section (or use a tool that does that for you, see below). You can give your image a short id that you can use to assign it to statements or arguments.

Here is how you add this information in the frontmatter section for the "dog1.jpg" image:

```argdown
===
images:
    files:
        dog1: {path: "dog1.jpg", width: 100, height: 85}
===
```

The path to your image file can either be a local path or a url (for security reasons it must be an "https://" address or be relative to the document's url). If you use a relative local file path the path will be relative to the location of your Argdown file.

Note that in the following examples we are actually using urls (e.g. `/dog1.jpg`), not local filepaths (the urls are relative to `https://argdown.org/`). You should always use urls if you want to publish your argument map on a web page using the web component.

:::tip Automatic size detection & inline images
Some Argdown tools will automatically add image sizes to your `images/files` frontmatter metadata and can create inline images. Note, that these tools will not overwrite your size information, so this will only work if you have not previously defined any widths or heights.

These tools support these features:

- `argdown-vscode`: all exports & the Argdown preview
- `@argdown/cli`: all exports, except Argdown-in-Markdown
- `@argdown/pandoc-filter`

Some other tools have no access to the filesystem and do _not_ support these features:

- `argdown-vscode`: Argdown-in-Markdown preview
- `@argdown/cli`: Argdown-in-Markdown html export
- `@argdown/markdown-it-plugin`
- `@argdown/marked-plugin`
- `@argdown/remark-plugin` and `@argdown/gatsby-remark-plugin`
- the Argdown sandbox
  :::

## Using tags to add images

Once you have added your image file information to your frontmatter section you can simply use the defined image ids as tags to add these images to your nodes.

Here is an example how you can visualize which statements and arguments a specific person or group agrees or disagrees with (a "position" in your debate):

```argdown-map
===
images:
    files:
        agree: {path: "/agree-icon.svg", width: 20, height: 20}
        disagree: {path: "/disagree-icon.svg", width: 20, height: 20}
color:
    colorScheme: iwanthue-green-mint
dot:
    argument:
        minWidth: 100
    statement:
        minWidth: 100
===

<a1> #pro #agree
    +> [s1] #pro #disagree
    <+ [s2] #pro #agree

<a2> #pro #disagree
    +> [s1]
    <- <a4> #con #agree

<a3> #con #disagree
    -> [s1]
```

Click on "Source" to see how easy it is to add these icons.

This feature can be deactivated by setting `images/useTags` to false.

## Using metadata to add images

You can also use metadata to add images to nodes. In this case you can **omit the frontmatter metadata**, as it will be created automatically from the metadata:

```argdown-map
Dogs are better than cats. {images: ["/dog1.jpg", "/dog2.jpg"]}
    >< Cats are better than dogs. {images: ["/cat1.jpg", "/cat2.jpg"]}
```

:::warning
This will only work without issue if the Argdown tools you are using are supporting automatic image size detection. For a list of tools that do, see the [top of this guide](/guide/adding-images.html#adding-images).

If you are encountering layout issues, you should add the image size information in the frontmatter section as described in [the previous section](/guide/adding-images.html#using-tags-to-add-images).
:::

This feature can be deactivated by setting `images/useData` to false.

## Changing the image position

You can change the image position by using the `dot/statement/images/position` and `dot/argument/images/position` settings:

```argdown-map
===
dot:
    statement:
        images:
            position: bottom
===

[Dogs!]: Dogs are better than cats. {images: ["/dog1.jpg", "/dog2.jpg"]}
    >< [Cats!]: Cats are better than dogs. {images: ["/cat1.jpg", "/cat2.jpg"]}
```

## Adding padding

You can add padding around the images by using the `dot/statement/images/padding` and `dot/argument/images/padding` setting:

```argdown-map
===
dot:
    statement:
        images:
            padding: 20
===

[Dogs!]: Dogs are better than cats. {images: ["/dog1.jpg", "/dog2.jpg"]}
    >< [Cats!]: Cats are better than dogs. {images: ["/cat1.jpg", "/cat2.jpg"]}
```

## Using "inline" images for better portability

If you do not want to depend on external image files, you can "inline" the images using data urls. This is recommended if you export your map to pdf or want to send someone your svg file. The downside of this method is that each instance of your image will increase the file size.

```argdown
===
images:
    convertToDataUrls: true
===

[Dogs!]: Dogs are better than cats. {images: ["/dog1.jpg", "/dog2.jpg"]}
    >< [Cats!]: Cats are better than dogs. {images: ["/cat1.jpg", "/cat2.jpg"]}

```

:::warning
Note that this feature is only supported by Argdown tools that have access to the filesystem. These are the same tools that support automatic image size detection, so you can check the list of those tools [at the beginning of this guide](/guide/adding-images.html#adding-images).

This documentation is built using `@argdown/markdown-it-plugin`, which does not support this feature, so the images in this example were _not_ transformed into inline pictures.
:::
