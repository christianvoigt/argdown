# How to read an argument map

To read an argument map you often have to combine arrows to infer the relation between two nodes. This section explains what you can infer from a path of arrows (and what not).

Before we start with an example, let us define what the dialectical support and attack relations mean in logical terms (see also the syntax documentation on [relations of reconstructed arguments](/syntax/#relations-of-reconstructed-arguments)):

| Dialectical Relation                | Logical Definition
--------------------------------------|---------------------|
| __Argument a supports argument b__| If a's main conclusion is _true_, a premise of b has to be _true_. |
| __Argument a attacks argument b__ | If a's main conclusion is _true_, a premise of b has to be _false_. |
| __Argument a supports statement p__ | If a's main conclusion is _true_, p has to be _true_ as well. |
| __Argument a attacks statement p__ | If a's main conclusion is _true_, p has to be _false_. |
__Statement p supports argument a__ | If p is _true_, a premise of a has to be _true_ as well. |
| __Statement p attacks argument a__ | If p is _true_, a premise of a has to be _false_. |

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

- argument __a__ supports statement __t1__, which also means that __a's__ main conclusion entails __t1__.
- statement __t1__ is contary to statement __t2__.
- statement __t2__ supports argument __b__, which also means that __t2__ entails a premise of __b__.
- argument __a__ attacks argument __b__, because (given the above relations) if __a's__ conclusion is true, a premise of __b__ has to be false.

But what about the relation between __a__ and __c__? Let's check:

- not true: if __a's__ conclusion is true, a premise of __c__ has to be _false_.
- not true: if __a's__ conclusion is true, a premise of __c__ has to be _true_. This is not the case, because __t2__ is only contrary to __t3__ and not contradictory. That __t2__ is contrary to __t3__ only means, that __t3__ has to be _false_, if __t2__ is _true_. It does _not_ mean that __t3__ has to _true_, if __t2__ is _false_. So even if if __a's__ conclusion is true and __t2__ is shown to be false, __t3__ can _still_ also be false.

So __a__ is neither supporting, nor attacking __c__. Things would be different if we change the relation between __t2__ and __t3__ to a contradiction:

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

Now a premise of __c__ has to be true if __a's__ conclusion is true. Why is that the case? Let's look at the new red arrow from __t3__ to __t2__, signifying that __t3__ is contrary to __t2__. It means "if t3 is true, t2 is false". This is equivalent to "if t2 is false, t3 is true". So if a's conclusion is true, __t3__ also has to be true, which means three things:

- argument __a__ supports statement __t3__.
- argument __a__ supports argument __c__.
- statement __t1__ actually entails statement __t3__.

You can avoid such complicated relations, if you use less statements from different equivalence classes that _only entail_ each other and instead simply use more members of the same [equivalence class](/syntax/#equivalence-classes). For example, if we only had used __t1__ instead of __t1__ and __t3__ in the last example, the relation between __a__ and __c__ is very easy to understand:

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
