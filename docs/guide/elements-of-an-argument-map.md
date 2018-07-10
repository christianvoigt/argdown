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

Argument maps are directed, non-hierarchical graphs consisting of __nodes__ and __edges__ connecting these nodes. The nodes are visualized as boxes and the edges are visualized as arrows. 

There are three kinds of nodes in Argdown argument maps:

| Node type               | What it looks like              |
|-----------------------|-------------------------|
| **Statement node**    | Visualized as round box with a thick colored border and white background. |
| **Argument node** | Visualized as round box with a colored background. |
| **Group node (cluster)** | Visualized as grey box containing other nodes. |

There are three edge colors in Argdown argument maps, representing the six different [relations of Argdown](/syntax/#relations):

- **Green arrows** visualize _support_ and _entail_ edges
- **Red arrows** visualize _attack_, _contrary_ and _contradiction_ edges
- **Purple arrows** visualize _undercut_ edges

As you can see, green and red edges each can represent several types of relations. Which relation a green or a red edge represents depends on its source and target node:

| What you see in the map | What it means |
|-------------------------|---------------|
| Two statement nodes are connected by a __green__ arrow. | The source __entails__ the target. |
| Two argument nodes or a statement and an argument node are connected by a __green__ arrow. | The source __supports__ the target |
| Two statement nodes are connected by two __red arrows__ going in both directions. | Two statements (of two equivalence classes) are __contradictory__. |
| Two statements are only connected by one __red arrow__.|The source is __contrary__ to the target.|
| Two arguments or a statement and an argument are connected by a __red arrow__. | The source __attacks__ the target. |

