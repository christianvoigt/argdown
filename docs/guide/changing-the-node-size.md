# Changing the node size

Methods to change the node size differ for the different map exports. We start with the methods for Dot, VizJs and Dagre and end with the [method for GraphML](#changing-the-node-size-in-graphml).

## Changing the node size for Dot/VizJs/Dagre

The dot export, VizJs map and Dagre map support two methods of changing the node width.

In both cases the Argdown app has to add line breaks to the node labels to force a certain node width. The node width is changed by customizing the method by which the line breaks are added.

### The `charactersInLine` Setting

By default a line break is added after a certain maximum number of characters (respecting word boundaries). This behaviour is customized by using the `charactersInLine` setting. This simple method is fast and works surprisingly well in practice.

Here is an example of customizing the dot export with different `charactersInLine` settings for groups, arguments and nodes:

```argdown
===
dot:
    group:
        charactersInLine: 1000
    argument:
        minWidth: 0
        title:
            charactersInLine: 12
        text:
            charactersInLine: 12
    statement:
        minWidth: 0
        title:
            charactersInLine: 30
        text:
            charactersInLine: 30
===

# A group with a very very very long title that does not contain a line break even though it is really long

[A statement with a long title]: This statement states that it is a long statement, longer than many many other claims commonly used in a debate.
    - <An argument with a long title>: A description that goes on for a while and does not stop too soon. Here is another sentence. And another one.

```

Note that you have to define separate `charactersInLine` settings for the title labels and text labels of argument and statement nodes. This is necessary because you can also use different font sizes for them, so you might want to set `charactersInLine` lower if the font size is larger.

### The `measureLineWidth` Setting

Alternatively, you can try a more exact and slower method by turning on `measureLineWidth`. In this case the actual pixel width of each word is measured and a line break is added after a certain maximum number of pixels (once again respecting word boundaries).

This behaviour is customized by using the `lineWidth` setting. Here is an example of turning on and customizing `measureLineWidth` for the VizJs map:

```argdown
===
dot:
    measureLineWidth: true
    group:
        lineWidth: 1000
    argument:
        lineWidth: 80
        minWidth: 0
    statement:
        lineWidth: 220
        minWidth: 0
===

# A group with a very very very long title that does not contain a line break even though it is really long

[A statement with a long title]: This statement states that it is a long statement, longer than many many other claims commonly used in a debate.
    - <An argument with a long title>: A description that goes on for a while and does not stop too soon. Here is another sentence. And another one.
```

In this case there are no separate settings for title and text as the line width is measured by taking different font sizes into account.

For the text measurement we use the [string-pixel-width](https://github.com/adambisek/string-pixel-width) library to be able to measure text outside of the browser. Please note that the library only supports measuring a limited number of fonts, so this option might not work with your font. Please consult the library's [Readme](https://github.com/adambisek/string-pixel-width#readme) for further information.

### Using `minWidth` to Set a Uniform Minimum Node Width in Dot

In the dot export (and the VizJs map by extension) the `minWidth` property will be used as a minimum node width. If `minWidth = 0` the default GraphViz behaviour will be used, which means that the node width is set to `maxLineWidthInLabel + horizontalMargin`. This behaviour saves space, but it has the downside that nodes have different widths, depending on their label content. This lack of uniformity might make the map look messy.

Argdown sets the minWidth for argument and statement nodes by default to `180` which means that the node width is now set to `max(180, maxLineWidthInLabel) + horizontalMargin`.

Here is the default behaviour:

```argdown
<a1>
    - <A veeeeeeeery long title>
```

Here is the result if you use `minWidth: 0`:

```argdown
===
dot:
    argument:
        minWidth: 0
===

<a1>
    - <A veeeeeeeery long title>
```

### Setting Margins for Nodes and Groups in Dot

You can use the `margin` dot setting to customize the sizing of statements, arguments and groups in dot (and the VizJs map):

```argdown
===
map:
    argumentLabelMode: title
dot:
    argument:
        minWidth: 0
        margin: "0.8, 0"
    statement:
        minWidth: 0
        margin: "0, 0.8"
    group:
        margin: "80"
===

# A group

[s1]: A statement
    - <argument>: An argument
```

## Changing the Node Size in GraphML

Because the GraphML export is not used in a live preview, performance is not as important so it _always_ uses the line measurement method.

In contrast to the Dot export and the Dagre map, node width can be set directly. Together with the `horizontalPadding` setting it determines the node's line width.

Here are the node size configuration options for GraphML:

```argdown
===
graphml:
    argument:
        width: 100
        horizontalPadding: 20
        verticalPadding: 10
    statement:
        width: 150
        horizontalPadding: 20
        verticalPadding: 10
    group:
        horizontalPadding: 20
        verticalPadding: 20
===

...
```
