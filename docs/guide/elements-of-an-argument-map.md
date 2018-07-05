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

Argument maps are directed, non-hierarchical graphs consisting of "nodes" and "edges" connecting these nodes. The nodes are visualized as boxes and the edges are visualized as arrows. There are three kinds of nodes in Argdown argument maps:

- **Statement nodes**: visualized as boxes with a thick colored border and white background. Statement nodes are actually representing [equivalence classes](/syntax/#equivalence-classes) which are sets of equivalent statements.
- **Argument nodes**: visualized as boxes with a colored background.
- **Group nodes (clusters)**: visualized as grey boxes containing other nodes.

There are three edge colors in Argdown argument maps, representing the six different [relations of Argdown](/syntax/#relations):

- **Green arrows** visualize _support_ and _entail_ edges
- **Red arrows** visualize _attack_, _contrary_ and _contradiction_ edges
- **Purple arrows** visualize _undercut_ edges

As you can see, green and red edges each can represent several types of relations. Which relation a green or a red edge represents depends on its source and target node:

- If _two statement nodes_ are connected by a green arrow, the source _entails_ the target.
- If _two argument nodes or a statement and an argument node_ are connected by a green arrow, the source _supports_ the target.
- If _two statement nodes_ are connected by _two_ red arrows going in both directions, the statements (of the two equivalence classes) are _contradictory_.
- If _two statements_ are only connected by _one_ red arrow, the source is _contrary_ to the target.
- If _two arguments or a statement and an argument_ are connected by a red arrow, the source _attacks_ the target.
