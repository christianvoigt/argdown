---
title: Colorizing maps
meta:
  - name: description
    content: How to colorize the nodes, edges and groups of your Argdown argument map.
---

# Colorizing maps

You can colorize argument and statement nodes by giving them tags:

```argdown
===
selection:
    excludeDisconnected: false
===

<a> #tag-1

<b> #tag-2

[c] #tag-3 #tag-2

<b> #tag-1
```

As the example shows, the first tag applied to an element is used to determine its color. Additional tags are ignored.

## The `colorScheme` setting

Now where did the color come from and how can you change it? It is coming from a list of colors called `colorScheme` and you can change it in the color settings to use a number of alternative color scheme presets or choose you own colors.

Let's first use another preset:

```argdown
===
color:
    colorScheme: iwanthue-red-roses
selection:
    excludeDisconnected: false
===

<a> #tag-1

<b>: #tag-2 #tag-1

[c] #tag-3

<b>: #tag-3

[d]: a statement without a tag
```

Here are the presets that come shipped with the Argdown parser:

[Color Brewer](http://colorbrewer2.org/) schemes (also used by D3):

- `colorbrewer-category10`
- `colorbrewer-accent`
- `colorbrewer-dark2`
- `colorbrewer-paired`
- `colorbrewer-set`
- `colorbrewer-set2`
- `colorbrewer-set3`

[I want hue](http://tools.medialab.sciences-po.fr/iwanthue/) schemes:

- `iwanthue-colorblind-friendly`
- `iwanthue-fancy`
- `iwanthue-fluo`
- `iwanthue-red-roses`
- `iwanthue-ochre-sand`
- `iwanthue-yellow-lime`
- `iwanthue-green-mint`
- `iwanthue-ice-cube`
- `iwanthue-blue-ocean`
- `iwanthue-indigo-night`
- `iwanthue-purple-wine`

If you want a different look you can also define you own custom color theme:

```argdown
===
color:
    colorScheme:
        - "#FFA44F"
        - "#ff4f98"
        - "#51ffae"
        - "#f3d942"
selection:
    excludeDisconnected: false
===

<a> #tag-1

<b>: #tag-2 #tag-1

[c] #tag-3

<b>: #tag-3

[d]: a statement without a tag.
```

Argument or statement nodes without any tags will always get the color at index 0.

The first tag used in the document will get the color at index 1, the second tag used in the document will get the color at index 2, the third will get the color at index 3 and so on.

## Colorizing groups with a `groupColorScheme`

Groups are colored by their own color scheme. By default, the group level is used to assign colors. You can change the group color scheme with the `groupColorScheme` color setting. The group color scheme has no presets except the default preset.

```argdown
===
color:
    colorScheme: colorbrewer-set2
    groupColorScheme:
        - "#fff2ae"
        - "#f4cae4"
        - "#b3e2cd"
selection:
    excludeDisconnected: false
group:
    groupDepth: 3
===

# H1

<a>: #tag-1

## H2

<b>: #tag-2 #tag-1

### H3

[c]: #tag-3

<b>: #tag-3
```

## The `tagColors` setting

Sometimes you do want more control over which tags get which colors. You can use the `tagColors` color setting to map tags to colors directly.

The color can be a hex color string or a number. If it is a number, the number refers to the color in the colorScheme at that index. It is recommended to use the latter option in combination with a color scheme as it enables you to quickly swap out color schemes and try different color combinations.

The color scheme is zero-based, so the first color is at index 0. The color at index 0 is always used as default color for argument and statement nodes.

```argdown
===
color:
    colorScheme: colorbrewer-set3
    tagColors:
        tag-1: "#169b89"
        tag-2: 7
        tag-3: 2
selection:
    excludeDisconnected: false
===

<a> #tag-1

<b>: #tag-2 #tag-1

[c] #tag-3

<b>: #tag-3
```

## Changing the tag priority

If some tag should always be used for colorizing, regardless of its position in a statement or description, you can use an object in the tagColors map and add color and priority fields to it. Higher priority numbers will get precedence:

```argdown
===
color:
    colorScheme: colorbrewer-set3
    tagColors:
        tag-1: {color: "#169b89", priority: 2}
        tag-2: {color: 3, priority: 1}
        tag-3: 2
selection:
    excludeDisconnected: false
===

<a> #tag-1

<b>: #tag-2 #tag-1

[c] #tag-3 #tag-2

<b>: #tag-3
```

In this example argument **b** gets now the color of **#tag-1** and statement **c** gets now the color of **#tag-2**.

## Changing the group color by tag

You can also color groups by tag. By default this is disabled to avoid confusion with the different color scheme indices: If a tag gets applied to statements or arguments, the index number will refer to the normal color scheme. But if it gets applied to a group, the index number will refer to the group color scheme.

You can enable this mode with the `colorizeGroupsByTag` setting. It is probably a good idea to disable `colorizeByTag` for statements and arguments if you do so.

```argdown
===
color:
    colorizeByTag: false,
    colorizeGroupsByTag: true
    tagColors:
        tag-1: "#e6f5c9"
        tag-2: 0
        tag-3: 2
    groupColorScheme:
        - "#fff2ae"
        - "#f4cae4"
        - "#b3e2cd"
selection:
    excludeDisconnected: false
group:
    groupDepth: 3
===

# H1 #tag-1

<a>: text

## H2 #tag-2

<b>: text

### H3 #tag-3

[c]: text
```

## Changing the node color by title

If you do not want to colorize nodes based on tags or group level but by titles, you can use the`statementColors`, `argumentColors` and `groupColors` color settings to directly assign colors to statements, arguments or groups.

As before the color can be a hex color string or a number. If it is a number, the number refers to the color in the colorScheme at that index. It is recommended to use the latter option in combination with a color scheme as it enables you to quickly swap out color schemes and try different color combinations.

The color scheme is zero-based, so the first color is at index 0. The color at index 0 is always used as default color for argument and statement nodes.

```argdown
===
color:
    colorScheme: iwanthue-colorblind-friendly
    statementColors:
        c: 2
    argumentColors:
        a: "#64b964"
        b: 7
    groupColors:
        H1: "#b3e2cd"
        H2: 0
        H3: 1
    groupColorScheme:
        - "#fff2ae"
        - "#f4cae4"
        - "#b3e2cd"
selection:
    excludeDisconnected: false
===

# H1

<a>: #tag-1

## H2

<b>: #tag-2 #tag-1

## H3

[c]: #tag-3

<b>: #tag-3
```

## The `color` data field

You can also directly assign colors by using the `color` data field.

As before the color can be a hex color string or a number. If it is a number, the number refers to the color in the colorScheme at that index. It is recommended to use the latter option in combination with a color scheme as it enables you to quickly swap out color schemes and try different color combinations.

The color scheme is zero-based, so the first color is at index 0. The color at index 0 is always used as default color for argument and statement nodes.

```argdown
===
color:
    colorScheme: iwanthue-fluo
    groupColorScheme:
        - "#fff2ae"
        - "#f4cae4"
        - "#b3e2cd"
selection:
    excludeDisconnected: false
===

# H1 {color: 2}

<a>: #tag-1 {color: 6}

## H2 {color: "#fdcdac"}

<b>: #tag-2 #tag-1 {color: 3}

## H3

[c]: #tag-3 {color: "#64b964"}

<b>: #tag-3
```

While this might seem comfortable, it will clutter your Argdown code with data elements and tightly couple data and representation.

Because of this, it is recommended to use the other options available. For cases in which other authors have assigned color with data elements in their Argdown documents, you can use the `ignoreColorData` setting.

## The `ignoreColorData` setting

If you want to ignore the colors assigned in data elements of an Argdown document, you can use the `ignoreColorData` color setting:

```argdown
===
color:
    colorScheme: iwanthue-yellow-lime
    groupColorScheme:
        - "#fff2ae"
        - "#f4cae4"
        - "#b3e2cd"
    ignoreColorData: true
selection:
    excludeDisconnected: false
===

# H1 {color: 2}

<a>: #tag-1 {color: 6}

## H2 {color: "#fdcdac"}

<b>: #tag-2 #tag-1 {color: 3}

## H3

[c]: #tag-3 {color: "#64b964"}

<b>: #tag-3
```

## Changing edge colors

You can change the edge colors with the `relationColors` group setting:

```argdown
===
model:
    mode: strict
color:
    relationColors:
        support: "#3CB371"
        attack: "#8B0000"
        undercut: "#FFD700"
        contrary: "#FFA500"
        contradictory: "#663399"
        entails: "#7FFF00"
===

<a1>
    <- <a2>
    <+ <a3>
    <_ <a4>

[s1]
    <- [s2]
    <+ [s3]
    >< [s4]
```

## Changing font colors

Some color schemes might be too dark with black text for argument labels. In this case you should change the label text color to something lighter. We will also change the statementFontColor to blue and the groupFontColor to red, just because we can:

```argdown
===
color:
    colorScheme: iwanthue-indigo-night
    argumentFontColor: "#ffffff"
    statementFontColor: "#0000ff"
    groupFontColor: "#ff0000"
selection:
    excludeDisconnected: false
===

# H1

<a>: #tag-1

<b>: #tag-2 #tag-1

[c]: #tag-3

<b>: #tag-3
```
