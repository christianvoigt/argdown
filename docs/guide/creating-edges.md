# Creating edges

:::tip Reading tips
If you already have reconstructed the premise-conclusion-structure of your arguments and want to know how to connect your arguments with relations, read the syntax documentation on [relations of reconstructed arguments](/syntax/#relations-of-reconstructed-arguments).

To better understand the relations between your reconstructed arguments it is probably also a good idea to make yourself familiar with the difference between the ["loose" and "strict" modes](/syntax/#relations-between-statements) of the Argdown parser.
:::

Not all relations of an argument's internal [premise-conclusion-structure (pcs)](/syntax/#premise-conclusion-structures) will appear automatically as edges of argument nodes in the argument map.

:::definition Pcs-relations that will be visualized

- Only outgoing relations of an argument's __main conclusion__ are visualized as outgoing edges of the corresponding argument node.
- Only incoming relations of an argument's __premises or inferences__ are visualized as incoming edges of the corresponding argument node.

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

As you can see, the result is strange. Arguments __a__, __b__ and __e__ have disappeared completely.

The reason why a has dispappeared is that neither __b__, __c__, __d__ or __e__ are connected to __a__ with an outgoing relation of __a's__ main conclusion or an incoming relation of __a's__ premises or inferences. As a result, __a__ is not connected to any node in the map and is eliminated -- as all disconnected nodes are, by default. Because __b__ and __e__ only have relations to __a__, they are also eliminated from the map.

In contrast, arguments __c__ and __d__ are connected to each other through statement __s3__ and as a result they appear in the map, though not in the way we might have expected.

What do we have to do in order to add all arguments to the map and in order to connect __b__, __c__, __d__ and __e__ to __a__?

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

That is already much better. Arguments __a1__, __a2__, __c__ and __d__ are now added to the map. Argument __a1__ supports argument __a2__. The outgoing support to __c__ is visualized as a relation of __a1__. The incoming support from __d__ is visualized as a relation of __a2__.

What can we do so that __b__ and __e__ are also added to the map and connected to __a__? We have to insert __s1__ and __s5__ as statement nodes to the map. While we are at it, it seems only right to grant the same to __s3__.

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
