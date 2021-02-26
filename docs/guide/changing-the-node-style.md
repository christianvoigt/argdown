---
title: Changing the node style
meta:
  - name: description
    content: How to change labels, font styles and choose a canonical member for your nodes.
---

# Changing the node style

## The canonical member

[Equivalence classes](/syntax/#equivalence-classes) can have multiple statements as members. [Arguments](/syntax/#arguments) can have multiple descriptions as members. The Argdown parser has to pick one of these statements or descriptions to represent the equivalence class or the argument in the argument map. The member that is picked to officially represent an equivalence class or an argument is called the _"canonical member"_.

By default the Argdown parser simply picks the statement or description from the last definition in the document. Let's take a look at how this works:

```argdown
===
selection:
    excludeDisconnected: false
===

<a>: the most convincing argument in the world

<a>: quite obviously nothing more than a simple fallacy // automatically picked as canonical
```

To manually change the canonical member of an argument or equivalence class, you can use the `isCanonical: true` data flag:

```argdown
===
selection:
    excludeDisconnected: false
===

<a>: the most convincing argument in the world {isCanonical: true}

<a>: quite obviously nothing more than a simple fallacy
```

Note that it makes only sense to use this flag once. If you use it a second time, the first occurrence will be ignored.

## Changing the label mode

You can use the `argumentLabelMode` and `statementLabelMode` map settings to change the label type of argument and statement nodes:

- `title`: Show only the title of the statement or argument.
- `text`: Show only the text of the canonical statement or argument description.
- `hide-untitled` (default): Show title and text, but hide titles if the argument or equivalence class is anonoymous (has no manually defined title).
- `none`: Hide title and text and only show an empty node (useful for [oldschool argument maps and inference trees](/guide/creating-oldschool-argument-maps-and-inference-trees.html))

In the following example we use `title` for arguments and `text` for statements:

```argdown
===
title: Using the statementLabelMode and argumentLabelMode map settings.
map:
    statementLabelMode: text
    argumentLabelMode: title
===

[S1]: some text
    - <A1>: a description
```

## Removing tags from text

You can remove any tags from statement or description text by using the `removeTagsFromText` model setting:

```argdown
===
model:
    removeTagsFromText: true
selection:
    excludeDisconnected: false
===

<a>: An #tag-1 argument #tag-2 description #tag-3 without #tag-4 any #tag-5 tags #tag-6
```

## Changing the font style of node labels

Font size, font and boldness of text in the Dot/GraphML exports and VizJs/Dagre maps can be customized for groups, arguments and statements. Here is how you do it for the dot export and the VizJs map:

```argdown
===
dot:
    group:
        fontSize: 25
        font: impact
        bold: true
    statement:
        title:
            fontSize: 14
            bold: true
            font: impact
        text:
            font: times new roman
            fontSize: 12
    argument:
        title:
            fontSize: 16
            bold: true
            font: impact
        text:
            font: times new roman
            fontSize: 12
===

[Statement]: Some text
    - <Argument>: Some text
```

Similar configuration options exist for `dagre` and `graphml` configuration.

Please note that VizJs only supports a [small number of fonts](https://github.com/mdaines/viz.js/wiki/Caveats#Fonts) and the same is true for the library that is used by all map export plugins for [text width measurement](#The-measureLineWidth-Setting). Please consult these links for the fonts available.

## Changing the node shape and style

You can use the `dot/argument/shape` and `dot/statement/shape` settings to [choose one of the node shapes supported by Graphviz](https://graphviz.org/doc/info/shapes.html) and the `dot/argument/style` and `dot/statement/style` settings to [change the node style](https://graphviz.org/doc/info/shapes.html):

```argdown
===
dot:
    argument:
        shape: circle
        style: filled
        minWidth: 0
    statement:
        shape: star
        style: filled, dashed
        minWidth: 0
===

<a1>
    +> [s1]
    <- <a2>
        + [s2]
```
