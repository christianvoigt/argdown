---
home: true
heroImage: /argdown-arrow.png
actionText: Get Started →
actionLink: /guide/
features:
- title: Simple
  details: Writing pro & contra lists in Argdown is as simple as writing a twitter message. You don't have to learn anything new, except a few simple rules that will feel very natural. 
- title: Expressive
  details: With these simple rules you will be able to precisely define complex dialectical relations between arguments or dive into the details of their logical premise-conclusion structures. What kind, style and depth of logical analysis you choose is completely up to you.
- title: Powerful
  details: Your document is transformed into an argument map while you are typing. You can export your analysis as HTML, SVG, PDF, PNG or JSON. If that is not enough, you can easily extend the Argdown tool chain with your own plugin.

footer: MIT Licensed | Copyright © 2018-present Christian Voigt

---

## Learn Argdown in 3 minutes

Argdown's formula consists of three hand-picked ingredients:

### 1. Nested Pro-Contra Lists

```argdown
// a daring statement with a title:
[Argdown is the best]: Argdown is the best tool for analyzing complex argumentation
and creating argument maps.
  // a well-deserved argument attacking this braggy statement:
  - <Editors easier>: Argument map editors are easier to use. #pro-editor
    // an argument supporting "Editors easier":
    + <WYSIWYG>: In argument map editors what you see during editing
      is what you get at the end: an argument map. #pro-editor
  // an argument supporting "Argdown is the best":
  + <Pure Data>: With Argdown no user interface gets in your way. You can focus on writing
    without getting distracted.
```

Click on the **Map** button in the upper right corner to see the resulting argument map.

### 2. Premise-Conclusion-Structures

```argdown
// Let's start with the little debate from before:
[Argdown is the best]
  - <Editors easier> #pro-editor
    + <WYSIWYG> #pro-editor
  + <Pure Data>

// Next comes the argument's title we want to logically reconstruct:
<Word Analogy>

// the argument's premise-conclusion structure:
(1) [Word @#*%!]: // let's give the first premise a nice shoutable title
    It is much easier to write
    and format a text with Markdown than it is with Word.
(2) Markdown and Word are comparable in their ease of use
    to Argdown and argument map editors respectively.
----- // the inference
// And now we come to our (not quite inescapable) conclusion:
(3) It is much easier to analyze complex argumentation and create argument maps with Argdown
    than it is with argument map editors.
    // This conclusion has an outgoing relation:
    -> <Editors easier>
```

Click on the **Map** button in the upper right corner to see the resulting argument map.

### 3. Markdown

```argdown
# Text formatting

You can use __many__  (though not all) *features* of [Markdown](http://commonmark.org/) to format Argdown text.

## Headings are used to group statement and arguments in the map

You can use #hashtags to color statements and arguments in the map.
```

For this example, no map will be generated, as the Argdown source code contains no statements or arguments connected by support or attack relations.

## Next steps

Now that you have learned the basics of Argdown you can cet started with our [guide](/guide). Or you can directly try out Argdown in the [browser sandbox](https://christianvoigt.github.io/argdown/sandbox).
