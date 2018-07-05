# How to read an argument map

To read an argument map you often have to combine arrows to infer the relation between two nodes. This section explains what you can infer from a path of arrows (and what not).

Before we start with an example, let us define what the dialectical support and attack relations mean in logical terms (see also the syntax documentation on [relations of reconstructed arguments](/syntax/#relations-of-reconstructed-arguments)):

1.  **Argument to argument:**
    - Argument a **supports** argument b: If a's main conclusion is _true_, a premise of b has to be _true_ as well.
    - Argument a **attacks** argument b: If a's main conclusion is _true_, a premise of b has to be _false_.
2.  **Argument to statement:**
    - Argument a **supports** statement p: If a's main conclusion is _true_, p has to be _true_ as well.
    - Argument a **attacks** statement p: If a's main conclusion is _true_, p has to be _false_.
3.  **Statement to argument:**
    - Statement p **supports** argument a: If p is _true_, a premise of a has to be _true_ as well.
    - Statement p **attacks** argument a: If p is _true_, a premise of a has to be _false_.

Now let us look at an example where we have to combine several red and green arrows to find out if an argument attacks or supports another argument:

```argdown-map
===
model:
    removeTagsFromText: true
===

<a> #1

(1) s1
(2) s2
----
(3) s3
    +> [t1]: s4 #1
        -> [t2]: s5 #2
            -> [t3]: s6 #3


<b> #2

(1) [t2]
(2) s7
----
(3) s8

<c> #3

(1) [t3]
(2) s9
----
(3) s10
```

It is relatively easy to infer the relation between a and b (in the following I speak of statements instead of equivalence classes to make things easier, but you should keep in mind that statement nodes are actually representing whole classes of equivalent statements):

- argument a supports statement t1, which also means that a's main conclusion entails t1.
- statement t1 is contary to statement t2.
- statement t2 supports argument b, which also means that t2 entails a premise of b.
- argument a attacks argument b, because (given the above relations) if a's conclusion is true, a premise of b _has to be_ false.

But what about the relation between a and c? Let's check:

- not true: if a's conclusion is true, a premise of c has to be _false_.
- not true: if a's conclusion is true, a premise of c has to be _true_. This is not the case, because t2 is only contrary to t3 and not contradictory. That t2 is contrary to t3 only means, that t3 has to be _false_, if t2 is _true_. It does _not_ mean that t3 has to _true_, if t2 is _false_. So even if if a's conclusion is true and t2 is shown to be false, t3 can _still_ also be false.

So a is neither supporting, nor attacking c. Things would be different if we change the relation between t2 and t3 to a contradiction:

```argdown-map
===
model:
    removeTagsFromText: true
===

<a> #1

(1) s1
(2) s2
----
(3) s3
    +> [t1]: s4 #1
        -> [t2]: s5 #2
            >< [t3]: s6 #3

<c> #3

(1) [t3]
(2) s9
----
(3) s10
```

Now a premise of c _has to be_ true if a's conclusion is true. Why is that the case? Let's look at the new red arrow from t3 to t2, signifying that t3 is contrary to t2. It means "if t3 is true, t2 is false". This is equivalent to "if t2 is false, t3 is true". So if a's conclusion is true, t3 also has to be true, which means three things:

- argument a supports statement t3
- argument a supports argument c
- statement t1 actually entails statement t3.

You can avoid such complicated relations, if you use less statements from different equivalence classes that _only entail_ each other and instead simply use more members of the same [equivalence class](/syntax/#equivalence-classes). For example, if we only had used t1 instead of t1 and t3 in the last example, the relation between a and c is very easy to understand:

```argdown-map
===
model:
    removeTagsFromText: true
===

<a> #1

(1) s1
(2) s2
----
(3) [t1]: s3
        -> [t2]: s5 #2

<c> #3

(1) [t1]
(2) s9
----
(3) s10
```

It depends on the argumentation you are reconstructing, but often it is possible to simplify your map by reducing the number of equivalence classes and entailments between them.
