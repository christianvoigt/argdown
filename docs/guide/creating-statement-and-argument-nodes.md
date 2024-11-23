---
title: Creating statement and argument nodes
meta:
  - name: description
    content: How you can select which statements and arguments appear as nodes in your argument map.
---

# Creating statement and argument nodes

This section describes how the Argdown parser decides which statements and arguments are represented as nodes in the generated argument map and how you can change this behaviour.

In general, all arguments with at least one relation are added as nodes to the argument map. But you can also be more selective. For example, you might want to create a map with arguments from a certain [section](#selecting-nodes-by-section) or with a certain [tag](#selecting-nodes-by-tag).

The default rules that decide which _statements_ will get their own node [are more complicated](#choosing-a-statementselectionmode). The Argdown parser tries to keep the number of statement nodes as low as possible to support visualizing complex debates with many arguments in comparatively compact maps. For example, this allows you to "hide" unimportant premises in your arguments and only introduce the premises you really care about as nodes in your map.

:::tip Choose your own style

In this respect Argdown distinguishes itself from many argument mapping tools that represent arguments only as "inference nodes" that link different premises together. Such tools force you to represent every statement and inferential step as a node in your map. This becomes quickly overwhelming and unmanagable in complex debates (at least if you reconstruct every argument's premise-conclusion-structure in detail).

In contrast, Argdown lets you choose what you want to emphasize in your map. You can even choose to only add the central thesis of the debate to your map and otherwise only visualize arguments (that may contain many inferential steps). This is a good choice for complex debates.

On the other hand, for small debates or single arguments, you might prefer the "oldschool" style of argument mapping that represents each statement and inferential step as its own node in the map. In that case just follow [these step](/guide/creating-oldschool-argument-maps-and-inference-trees.html) and you are good to go.
:::

The selection process is divided up into two phases:

:::definition

**Preselection round:** In the preselection round, statements and arguments are excluded based on selected [sections](#selecting-nodes-by-section), [tags](#selecting-nodes-by-tag), [titles](#selecting-nodes-by-title) or [flags](#selecting-nodes-with-the-isinmap-data-flag).

**Selection round:** In the selection round, it is checked in which relations these preselected elements stand to other preselected elements. This is the round in which the [`excludeDisconnected` setting](#the-excludedisconnected-selection-setting) and the [`statementSelectionMode`](#choosing-a-statementselectionmode) are applied. It is also the round in which you can choose to include "extra" statements from the preselection with the [`includeStatements` setting](#selecting-nodes-by-title) or the [`isInMap:true` flag](<(#selecting-nodes-with-the-isinmap-data-flag)>).

:::

Let us start with the latter, as this is the round that is excluding arguments and statements by default, even if you do not change any settings.

In contrast, the preselection round will only exclude statements or arguments, if you explicitely tell it to do so by using the selection settings or the `isInMap` data flag.

## The `excludeDisconnected` selection setting

By default only statements and arguments are represented by nodes in the argument map that are considered to be _connected_ to another node in the map. A statement counts as connected, if its [equivalence class](/syntax/#equivalence-classes) is.

:::definition Connected elements

An equivalence class is considered to be **connected** if at least one of the following conditions applies:

- It is used in a preselected argument's premise-conclusion-structure as **premise** or **conclusion**.
- It has **at least one relation** to a preselected element.

An argument is considered to be **connected** if at least one of the following conditions applies:

- The **argument** itself is directly related to another preselected element.<!-- versteht man nicht: "has logically unreconstructed relations."-->
- A **premise is supported/attacked** by another preselected element.
- The **main conclusion is supporting/attacking** another preselected element.
- An **inference is undercut** by a preselected element.
- **Support by equivalence:** a premise is equivalent with a main conclusion or the main conclusion is equivalent with a premise of another preselected argument.
  :::

The exclusion of disconnected statements from the map allows you to comment on your reconstruction by adding meta-statements in the Argdown text without 'polluting' your argument map with them. If you want to disable this feature you can use the `excludeDisconnected: false` selection setting:

```argdown
===
title: Including disconnected nodes
selection:
    excludeDisconnected: false
===

<a>: I am currently in no relation.

<b>: It's complicated.

<c>: I feel disconnected.
```

Click on the map button in the top right to see these three sad arguments appearing in the map.

## Choosing a `statementSelectionMode`

The Argdown parser supports several different general methods to exlude equivalence classes from the selection. You can change the method used by choosing a `statementSelectionMode` in the selection settings. This section describes the different modes currently supported.

:::tip Managing complexity in your map
In contrast to arguments, not all preselected and connected equivalence classes will appear as statement nodes in the map. While you can easily change this behaviour, it is quite important to keep the number of statement nodes in your map as low as possible.

If you include all statements of a a complex debate as nodes in your map, it will become overcrowded and readers will have difficulty to stay orientated. Choosing which statements you visualize as nodes in your map is a crucial method of managing complexity.
:::

In three special cases, any of the modes described further below will **not** exclude equivalence classes:

:::definition Equivalence classes that will be selected as nodes by all modes

1.  The `isInMap` [data flag](#selecting-nodes-with-the-isinmap-data-flag) is set to true.
2.  The statement title is included in the `includeStatements` [selection setting](#selecting-nodes-by-title).
3.  The equivalence class - has relations - and is not used in any preselected argument as premise or conclusion.

:::

The third case may need an explanation: Relations of such equivalence classes can not be represented by edges of argument nodes, so it is important to represent them with statement nodes or they will be lost. In most cases you will want to include them in your map.

If you still want to exclude such equivalence classes you have to use the `excludeStatements` [selection setting](#selecting-nodes-by-title) or set its `isInMap` [data flag](#selecting-nodes-with-the-isinmap-data-flag) to false.

Now let's take a look at what the different modes are doing:

### `all` mode

Includes each equivalence class that is connected to a preselected element (argument or statement).

```argdown
===
selection:
    statementSelectionMode: all
===

<a>

(1) [title]: I am selected
(2) I am selected
----
(3) I am selected
    -> I am selected
        + <b>

<a>
    - I am selected

[another title]: not very exciting, isn't it? // not selected
```

### `not-used-in-argument` mode

Excludes any equivalence class that is used in an argument (as premise or conclusion).

```argdown
===
selection:
    statementSelectionMode: not-used-in-argument
===

<a>

(1) [title]: I am not selected
(2) I am not selected
----
(3) I am not selected
    -> I am selected
        + <b>

<a>
    - I am selected

[another title]: I am not selected
```

### `with-title` mode (default mode)

Excludes any equivalence class that is anonymous (has no title).

```argdown
===
selection:
    statementSelectionMode: with-title
===

<a>

(1) [title]: I am selected
(2) I am not selected
----
(3) I am not selected
    -> I am selected

<a>
    - I am selected
        + <b>

[another title]: slightly more interesting. // still not selected
```

### `with-relations` mode

Excludes any equivalence class that has no relations.

```argdown
===
selection:
    statementSelectionMode: with-relations
===

<a>

(1) [title]: I am not selected
(2) I am selected
    -> <b>
----
(3) I am selected
    -> I am selected

<a>
    - I am selected
        + <b>

[another title]: still not selected
```

### `with-more-than-one-relation` mode

Excludes any equivalence class that has less than two relations.

```argdown
===
selection:
    statementSelectionMode: with-more-than-one-relation
===

<a>

(1) [title]: I am not selected
(2) I am not selected
    -> <b>
----
(3) I am not selected
    -> I am selected

<a>
    - I am selected
        + <b>

[another title]: still not selected
```

### `top-level` mode

Excludes any equivalence class that is not used as top-level block element. See the [introduction of the syntax documentation](/syntax/) for the definition of a top-level block element.

```argdown
===
selection:
    statementSelectionMode: top-level
===

<a>

(1) [title]
(2) I am not selected
----
(3) I am not selected
    -> I am selected

<a>
    - I am selected
        + <b>

[title]: I am selected.

[another title]: still not selected
```

## Selecting nodes by tag

You can use the `selectedTags` selection setting to preselect only those arguments and statements for further selection which are tagged with any of the chosen hashtags.

```argdown
===
title: >
    Preselecting only statements and arguments with the #core tag.
selection:
    selectedTags:
        - core
===

[t1] #core
    + <a> #core
        - <b>
    - <c> #core
        - <d>
            + <e>

<f>
    + [t1]
```

Only t1, a and c are selected. You can choose to also include statements or arguments without any tags by using the `selectElementsWithoutTag`:

```argdown
===
title: >
    Preselecting only statements and arguments without tag or with the #pro tag.
selection:
    selectedTags:
        - pro
    selectElementsWithoutTag: true
===

[t1] #core #pro
    + <a> #pro #core
        - <b> #con
    - <c> #core
        - <d> #con
            + <e> #pro

<f>
    + [t1]
```

Now argument **f** is included in the map, even though it is not tagged as well. You may have noticed that not all arguments with the **#pro** tag were selected. Argument **e** is missing from the map.

The reason is once again that disconnected nodes are excluded from the map. Argument **e's** only connection is to **d**, but **d** is neither tagged with the **#pro** tag nor is it without any tags (it is tagged with the **#con** tag). As a result, it is excluded from the map. This leaves **e** disconnected. So it is excluded as well.

## Selecting nodes by section

You can use the `selectedSections` selection setting to preselect only those arguments and statements for further selection, that are members of chosen sections. See the section on [creating groups](#creating-groups) to learn more about sections.

```argdown
===
title: >
    Preselecting only statements and arguments within the section H1
selection:
    selectedSections:
        - H1
===

[t1]: text
    + <a>
    - <b>

# H1

<a>: argument description
    + <c>: argument description
    - <d>: argument description

# H2

<b>: argument description
    + <e>: argument description
    - <f>: argument description
```

You can choose to also include statements or arguments without any section by using the `selectElementsWithoutSection`:

```argdown
===
title: >
    Preselecting only statements and arguments within the section H1 or without any section
selection:
    selectedSections:
        - H1
    selectElementsWithoutSection: true
===

[t1]: text
    + <a>
    - <b>

# H1

<a>: argument description
    + <c>: argument description
    - <d>: argument description

# H2

<b>: argument description
    + <e>: argument description
    - <f>: argument description
```

Note, that argument **b** is excluded, even though it is used outside of any section. This is because **b** is defined first in section **H2** and sections are by default assigned by their first definition. For more about how sections are assigned see [creating groups](#creating-groups).

## Selecting nodes by title

You can use the `includeStatements`, `excludeStatements` and `excludeArguments` selection settings to include or exclude elements by title.

```argdown
===
title: Including and excluding elements by title
selection:
    includeStatements:
        - t1
        - t2
    excludeStatements:
        - t3
    excludeArguments:
        - b
        - c
===

<a>

(1) [t1]: s1
(2) [t2]: s2
----
(3) [t3]: s3

[t3]: s3
    - <b>

<a>
    - <c>
    + <d>
```

Note that argument **b**, which would normally appear in the map together with **t3**, is now also excluded, because its only connection was to **t3**. Because **t3** is excluded **b** is now disconnected and falls victim to the `excludeDisconnected` default policy.

Why is there not also an `includeArguments` setting? It is not needed because by default _all_ connected arguments are added as nodes to the map. In contrast, only connected statements selected by the statementSelectionMode are added by default to the map. The `includeStatements` setting includes additional statements to the map that were not added by the statementSelectionMode. <!-- Unklar, streichen?: This means it is not an "exclusive" list of all equivalence classes that might be getting their own node in the map.-->

## Selecting nodes with the `isInMap` data flag

You can also pick single arguments or statements for the map by using the `isInMap` data flag directly in the Argdown code:

```argdown
===
title: Using the isInMap flag to select or deselect single elements.
sourceHighlighter:
    removeFrontMatter: true
===

<a>

(1) s1 {isInMap: true}
(2) s2
----
(3) s3 {isInMap: true}

<b> {isInMap: false}
    - <a>
```

The downside of this method is that you add map-specific data to elements in your Argdown document, thereby making it more difficult for others to change the selection and to generate a different map from the same document. This "tight coupling" of data and visualization is not recommended. If you want to pick single elements you should use the `includeStatements`, `excludeStatements` and `excludeArguments` selection settings instead. See the previous section for further details.

If you still prefer to use the `isInMap` data flag or if you want to override the flags of other authors, you can use the `ignoreIsInMap` selection setting. If set to true, all `isInMap` data flags in your document will be ignored:

```argdown
===
title: Ignoring isInMap flags
selection:
    ignoreIsInMap: true
    statementSelectionMode: not-used-in-argument
===

<a>

(1) s1 {isInMap: true}
(2) s2
----
(3) s3 {isInMap: true}

<b> {isInMap: false}
    - <a>
```

## Creating argument nodes for each inferential step

Using the `explodeArguments` option you can automatically create several argument nodes from a singular complex argument. Your premise-conclusion-structures will be divided up into separate inferential steps (containing only one inference and conclusion). Each step will be put into its own argument so that each inferential step is represented as an argument node in the map. The arguments will be renamed, appending the step number to their name.

Here is an example:

```argdown
===
model:
    explodeArguments: true
selection:
    statementSelectionMode: with-relations
===

<my complex argument>

(1) first premise
    - <a2> #con
(2) second premise
----
(3) intermediary conclusion
    - <a3> #con
(4) fourth premise
----
(5) main conclusion
    - <a5> #con

```

Note how in this case attacks against the intermediary conclusion can be visualized, because it was automatically added as a statement to the map (using the statementSelectionMode `with-relations`).

### Defining which statements are used in an inferential step

In complex arguments an inferential step sometimes does use statements for its inference that were already listed as premise in another inferential step. In other cases a conclusion of another inferential step is used that is not the directly preceding step.

In both of these cases you have to tell Argdown explicitly _which_ statements were used in the inferential step. You can do so by adding a metadata list to the conclusion or the inference:

```argdown
===
model:
    explodeArguments: true
selection:
    statementSelectionMode: all
dot:
    vizJsSettings:
        rankDir: TB
===

<my complex argument>

(1) first premise
(2) second premise
----
(3) first intermediary conclusion
(4) third premise
--
{uses: [1,4]}
--
(5) second intermediary conclusion
----
(6) main conclusion {uses: [3,5]}
```

:::tip The perfect configuration for your inference trees
Jump over to the section on [how to create oldschool argument maps and inference trees](/guide/creating-oldschool-argument-maps-and-inference-trees.html) for even more configuration tips on how to visualize the inferential structure of complex arguments.
:::
