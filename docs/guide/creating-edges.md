---
title: Creating edges
meta:
  - name: description
    content: How you can visualize relations as edges in your argument map.
---

# Creating edges

:::tip Reading tips
If you already have reconstructed the premise-conclusion-structure of your arguments and want to know how to connect your arguments with relations, read the syntax documentation on [relations of reconstructed arguments](/syntax/#relations-of-reconstructed-arguments).

To better understand the relations between your reconstructed arguments it is probably also a good idea to make yourself familiar with the difference between the ["loose" and "strict" modes](/syntax/#relations-between-statements) of the Argdown parser.

If you want to simply visualize the _complete_ inference trees of your logical reconstruction, you can skip this section and follow the steps in [the next section](/guide/creating-oldschool-argument-maps-and-inference-trees.html).
:::

Not all relations of an argument's internal [premise-conclusion-structure (pcs)](/syntax/#premise-conclusion-structures) will appear automatically as edges of argument nodes in the argument map.

:::definition Pcs-relations that will be visualized

- Only outgoing relations of an argument's **main conclusion** are visualized as outgoing edges of the corresponding argument node.
- Only incoming relations of an argument's **premises or inferences** are visualized as incoming edges of the corresponding argument node.

:::

Let's look at the following example:

```argdown
<a>

(1) s1
    -> <b>
(2) s2
------
(3) s3
    +> <c>
    <+ <d>
(4) s4
------
(5) s5
    <- <e>
```

As you can see, the result is strange. Arguments **a**, **b** and **e** have disappeared completely.

The reason why a has dispappeared is that neither **b**, **c**, **d** or **e** are connected to **a** with an outgoing relation of **a's** main conclusion or an incoming relation of **a's** premises or inferences. As a result, **a** is not connected to any node in the map and is eliminated -- as all disconnected nodes are, by default. Because **b** and **e** only have relations to **a**, they are also eliminated from the map.

In contrast, arguments **c** and **d** are connected to each other through statement **s3** and as a result they appear in the map, though not in the way we might have expected.

What do we have to do in order to add all arguments to the map and in order to connect **b**, **c**, **d** and **e** to **a**?

First, if you want to visualize the relations of an intermediary conclusion without adding the statement to the map, you should split the argument into two arguments instead:

```argdown
<a1>

(1) s1
    -> <b>
(2) s2
------
(3) [t1]: s3 {isInMap: false}
    +> <c>
    <+ <d>

<a2>

(1) [t1]: s3
(2) s4
-----
(3) s5
    <- <e>
```

That is already much better. Arguments **a1**, **a2**, **c** and **d** are now added to the map. Argument **a1** supports argument **a2**. The outgoing support to **c** is visualized as a relation of **a1**. The incoming support from **d** is visualized as a relation of **a2**.

What can we do so that **b** and **e** are also added to the map and connected to **a**? We have to insert **s1** and **s5** as statement nodes to the map. While we are at it, it seems only right to grant the same to **s3**.

```argdown
<a1>

(1) s1 {isInMap: true}
    -> <b>
(2) s2
------
(3) [t1]: s3 {isInMap: true}
    +> <c>
    <+ <d>

<a2>

(1) [t1]: s3
(2) s4
-----
(3) s5 {isInMap: true}
    <- <e>
```
