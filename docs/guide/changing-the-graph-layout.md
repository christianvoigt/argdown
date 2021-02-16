---
title: Changing the graph layout
meta:
  - name: description
    content: How to change the layout of your argument map
---

# Changing the graph layout

You have currently three options to layout your argument map with Argdown:

- export to Dot format and layout with Viz.js/Graphviz
- use Dagre
- export to GraphML and use the yEd graph editor

The first option is the one that is recommended in most cases. The second one should currently be considered "experimental".

You should use the third option if the customization options of the first two options are not enough and you want to have complete control over the look and layout of your map.

## Layouting with Viz.js

[Viz.js](https://github.com/mdaines/viz.js) is a version of [GraphViz](http://www.graphviz.org/) that runs in the browser and node.js. It is used in the Argdown tool chain for the svg export of maps (via the dot export) and for the live previews in the VSCode extension and the browser sandbox. Viz.js is also used for all examples in this documentation. In most cases using the Viz.js map will be the right choice for you.

:::tip Configuring the Viz.js map
Configuration options for the Viz.js map can be found in two places: Most of the configuration takes already place in the dot export and so most options are found in the `dot` section of the configuration. Only the configuration options that are not represented in the dot format are directly set in the `vizJs` section of the configuration.
:::

### Using `graphVizSettings` to change the layout

All GraphViz configuration options for graphs can be applied to your argument map by using the `graphVizSettings` option of the dot configuration. Please consult the [GraphViz documentation](https://www.graphviz.org/doc/info/attrs.html) or [this guide](https://www.graphviz.org/pdf/dotguide.pdf) for all the options you have.

Here is an example how to change some commons settings of the layout so that the node are really closely packed together and arrows point from left to right:

```argdown
===
dot:
    graphVizSettings:
        rankdir: LR
        concentrate: true
        ranksep: 0.2
        nodesep: 0.2
===

<a1>
    - <a2>
    - <a3>
    - <a4>
        + <a5>
        - <a6>
            - <a7>
```

### Assigning nodes to the same rank in Dot

Sometimes you might want to force a group of nodes to be at the same vertical position. You can use the `sameRank` setting and the `rank` data property to achieve this in the Viz.js map (see this [Stackoverflow question](https://stackoverflow.com/questions/25734244/how-do-i-place-nodes-on-the-same-level-in-dot) for an example).

#### Usage of the `sameRank` Setting in Dot Configuration

```argdown
===
dot:
    sameRank:
        - {arguments: ["a1", "a2"], statements: ["s1", "s2"]}
===

<a1>
    - <a2>
    + <a3>

[s1]
    - [s2]
    + [s3]
```

#### Usage of the `rank` Property in Element Data

```argdown
<a1> {rank: "r1"}
    - <a2>  {rank: "r1"}
    + <a3>  {rank: "r2"}

[s1]  {rank: "r1"}
    - [s2]  {rank: "r1"}
    + [s3]  {rank: "r2"}
```

If you want to put nodes of different groups (clusters) into the same rank, you might want to try the `newrank` [graphviz setting](https://graphviz.gitlab.io/_pages/doc/info/attrs.html#d:newrank):

```argdown
===
dot:
    graphVizSettings:
        newrank: true
===

# New Rank Test

## Heading 1

<a1> {rank: "r1"}
    - <a2>  {rank: "r1"}
    + <a3>  {rank: "r2"}
    -> [s1]

## Heading 2

[s1]  {rank: "r1"}
    - [s2]  {rank: "r1"}
    + [s3]  {rank: "r2"}
```

See this [Stackoverflow question](https://stackoverflow.com/questions/6824431/placing-clusters-on-the-same-rank-in-graphviz) for more information.

### Changing the Graphviz Layout Engine

Viz.js can be configured to use any of the GraphViz [layout engines](https://github.com/mdaines/viz.js/wiki/Supported-Graphviz-Features):

- circo
- dot (default)
- fdp
- neato
- osage
- twopi

```argdown
===
vizJs:
    engine: circo
===

<a1>
    - <a2>
    + <a3>
        - <a6>
        - <a7>
        - <a8>
    - <a4>
    + <a5>
        - <a9>
        - <a10>
        - <a11>
```

## Layouting with Dagre

Graphviz is probably the most widely used open-source library for graph layouting and has been around for a long time. In contrast, [Dagre](https://github.com/dagrejs/dagre) is a relatively young JavaScript library for hierarchical layouts. Because it is directly written in JavaScript it can use the full power of the browser to render the graph (this is done in [Dagre-D3](https://github.com/dagrejs/dagre-d3)). In contrast, Viz.js is compiled into Javascript, calls itself a "hack" and recommends checking out Dagre.

The downside of this approach is that Dagre-D3 will not work outside of the browser. This is the reason why there is currently no Dagre export for the commandline tool (cli). If you want to export a Dagre map you have to do so directly from the Dagre preview in the VSCode extension.

Development of Dagre-D3 currently is only slowly moving forward and there are some issues not yet fixed that cause problems in Argdown:

- Dagre-D3 can currently not create edges with arrow heads at both ends. These are needed to visualize the symmetric relations of contradiction and contrariness in strict mode. If you do not use strict mode, this will not be a problem.
- Edge paths are often not optimal compared to Viz.js
- Arrow heads are drawn below nodes

These are the reasons why we consider the Dagre map view still "experimental". However we hope that someday these issues will be fixed.

### Using the Dagre Settings to Change the Layout

Dagre has far fewer configuration options, but often these are enough:

- `rankSep`: the space between ranks in the hierarchy
- `nodeSep`: the space between nodes within one rank
- `rankDir`: direction of the hierarchy (BT, TB, LR or RL)

Here is an example in which the nodes are closely packed together and arrows point from left to right:

:::warning
Please note that the examples in this documentation always use Viz.js maps and can not display Dagre maps. To try out the Dagre-specific settings you have to paste the code into the [browser sandbox](https://argdown.org/sandbox) and activate the Dagre map.
:::

```argdown
===
dagre:
  rankDir: LR
  rankSep: 20
  nodeSep: 10
===


<a1>
    - <a2>
    + <a3>
        - <a6>
        - <a7>
        - <a8>
    - <a4>
    + <a5>
        - <a9>
        - <a10>
        - <a11>
```

## Layouting in the yEd Graph Editor

The amazing [yEd](https://www.yworks.com/products/yed) graph editor is probably the most powerful free tool for graph editing currently available. Its capabilities surpass even those of the Graphviz layout algorithms. One of its advantages is that it allows you to manually adjust the layout of your graph as much as you like. You can also use it like a vector graphics editor to style your nodes. At the same time it features very powerful graph algorithms with many configuration options for tuning the automatic layout of your map. However, it is easy to get lost in the plethora of options, so make sure you really need this level of customizability before choosing this option.

The Argdown tool chain enables you to export your argument map in a format (GraphML with yWorks extensions) that the yEd editor can directly read and write. There are only two downside to this:

- the Argdown parser is not able to read this format and transform it back into Argdown code. Once you exported your map, you can not reimport it, so make sure you finished your work in the Argdown editor before starting your work in yEd.
- the Argdown parser can not directly use yEd's graph layout algorithms to calculate positions for the nodes in your argument maps as they are not open-source algorithms. Instead it will simply put all node above each other. Once you open the map in yEd you have to layout the map (which can be done with a few clicks).

### How to import an Argdown map into yEd using the VSCode extension:

1. Open an existing Argdown document in VSCode.
2. Right click on the document title in the tab above the editor.
3. Click on `Export map data to GraphML` and choose where you want to save your file and click `Save`.
4. Download and install [yEd](https://www.yworks.com/products/yed) if you not have already done so.
5. Open yEd and click on `File/Open...` in the application's main menu bar. Browse to your file and open it. At this point your map will look terrible, because all nodes are put above each other. Don't worry, we will fix that in seconds.
6. Click on `Layout/Hierarchical` in the application's main menu bar.
7. Click on `Grouping` and select `Layout Groups` as "Layering Strategy".
8. Click on `Edges`. For Routing Style the best option for argument maps is probably `Polyline`, but you can also try out the other options.
9. Click "OK". Hopefully your map will look much nicer now. If you are not satisfied, click on `Layout/Hierachical` again and start customizing the layout options. You can also choose a completely different layout algorithm.

:::tip Other Layout Algorithms
Try out the BPMN and SBGN algorithms in yEd. They often produce very interesting alternative layouts.
:::

For more information on how to use yEd to customize your argument map read the [yEd Graph Editor Manual](https://yed.yworks.com/support/manual/index.html).
