---
title: Elements of an argument map
meta:
  - name: description
    content: Explains the different elements in an Argdown argument map.
---

# Elements of an argument map

```argdown-map
===
model:
    removeTagsFromText: true
===

[statement]: I am a statement. #tag1
 - <argument 1>
 + <argument 2>
    <_ <argument 3>

 # I am a group

<argument 1>: I am an attacking argument. #tag2

<argument 2>: I am a supporting argument. #tag3

## I am a subgroup

<argument 3>: I am an undercut argument. #tag4
```

Argument maps are directed, non-hierarchical graphs consisting of **nodes** and **edges** connecting these nodes. The nodes are visualized as boxes and the edges are visualized as arrows.

There are three kinds of nodes in Argdown argument maps:

| Node type                 | What it looks like                                                        |
| ------------------------- | ------------------------------------------------------------------------- |
| **Statement node**        | Visualized as round box with a thick colored border and white background. |
| **Argument node**         |  Visualized as round box with a colored background.                       |
| **Group node (cluster)**  | Visualized as grey box containing other nodes.                            |

To learn more about the difference between statements and arguments, read the syntax sections about [arguments in Argdown](/syntax/arguments).

There are three edge colors in Argdown argument maps, representing the six different [relations of Argdown](/syntax/#relations):

- **Green arrows** visualize _support_ and _entail_ edges
- **Red arrows** visualize _attack_, _contrary_ and _contradiction_ edges
- **Purple arrows** visualize _undercut_ edges

As you can see, green and red edges each can represent several types of relations. Which relation a green or a red edge represents depends on

- its source and target node,
- the arrow head
- if the arrow points in one or both directions
- and if you use Argdown in [loose or strict mode](/syntax/#relations-between-statements).

| What you see in the map                                                                                         | What it means                                                                                   |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Two statement nodes are connected by a **green** arrow.                                                         | Strict mode: The source **entails** the target. Loose mode: The source **supports** the target. |
| Two argument nodes or a statement and an argument node are connected by a **green** arrow.                      |  The source **supports** the target.                                                            |
| Two statement nodes are connected by a **red arrow** with triangle arrow heads going in both directions.        | Two statements (of two equivalence classes) are **contrary** to each other (strict mode).       |
| Two statement nodes are connected by a **red arrow** with diamond arrow heads going in both directions.         | Two statements (of two equivalence classes) are **contradictory** to each other.                |
| A statement or an argument is connected to another statement or argument by a directed (one-way) **red arrow**. | The source **attacks** the target.                                                              |
| Two arguments or a statement and an argument are connected by a **purple arrow**.                               | The source **undercuts** the target.                                                            |

:::tip Equivalence
Note that there is no arrow representing equivalent statements. The reason behind this is that each [equivalence class](/syntax/#equivalence-classes) can only be represented by _one_ statement in an Argdown argument map. However, if you _must_ visualize equivalence relations in your map, you can define entailment relations between two statements going both ways. Just be aware that this will not automatically merge the two statements into the same Argdown equivalence class.
:::
