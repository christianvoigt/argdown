---
title: Using logical symbols and emojis
meta:
  - name: description
    content: Using logical symbols and emojis
---

# Using logical symbols and emojis

You can use any unicode symbol you want in Argdown. However, it is often cumbersome to copy & paste special characters into a document. Instead you can use shortcodes in Argdown that will be transformed into unicode characters in all export formats.

Shortcodes are surrounded by dots or colons:

```argdown
[s1]: q :love:
    + <a1>:  p .^. (p .->. q)
        + <a2>: :+1: :happy:
```

Click on the "Map" button to see the unicode characters.

Here is a list of the shortcodes that are currently supported by default:

| Shortcodes                                         | Unicode character |
| -------------------------------------------------- | ----------------- |
| `.~.` or `:~:`                                     | ¬                 |
| `.A.` or `:A:`                                     | ∀                 |
| `.E.` or `:E:`                                     | ∃                 |
| `.->.` or `:->:`                                   | →                 |
| `.<->.` or `:<->:`                                 | ↔                 |
| `.^.` or `:^:`                                     | ∧                 |
| `.v.` or `:v:`                                     | ∨                 |
| `.v_.` or `:v_:`                                   | ⊻                 |
| `.<>.` or `:<>:`                                   | ◇                 |
| `.[].` or `:[]:`                                   | ◻                 |
| `.O.` or `:O:`                                     | 𝗢                 |
| `.P.` or `:P:`                                     | 𝗣                 |
| `.+1.` or `:+1:` or `.up.` or `:up:`               | 👍                |
| `.-1.` or `:-1:` or `.down.` or `:down:`           | 👎                |
| `.y.` or `:y:` or `.check.` or `:check:`           | ✔                 |
| `.n.` or `:n:` or `.cross.` or `:cross:`           | ❌                |
| `.?.` or `:?:` or `.question.` or `:question:`     | ❓                |
| `.star.` or `:star:`                               | ⭐                |
| `.heart.` or `:heart:`                             | ❤                 |
| `.happy.` or `:happy:`                             | 😀                |
| `.smile.` or `:smile:` or `.smiley.` or `:smiley:` | ☺️                |
| `.laugh.` or `:laugh:` or `.lol.` or `:lol:`       | 😆                |
| `.rofl.` or `:rofl:`                               | 🤣                |
| `.joy.` or `:joy:`                                 | 😂                |
| `.love.` or `:love:`                               | 😍                |
| `.wink.` or `:wink:`                               | 😉                |
| `.shush.` or `:sush:`                              | 🤫                |
| `.meh.` or `:meh:`                                 | 😐                |
| `.eye-roll.` or `:eye-roll:`                       | 🙄                |
| `.sad.` or `:sad:`                                 | 😢                |
| `.disappointed.` or `:disappointed`                | 😞                |
| `.scream.` or `:scream:`                           | 😱                |
| `.think.` or `:think:`                             | 🤔                |

## Adding custom shortcodes

If you are missing a special character in this list, you can simply add a custom shortcode in your configuration:

```argdown
===
model:
    shortcodes:
        ":bomb:": {unicode: "💣"}
===

[s1]
    - <a>: :bomb:
```

## Using the ArgVu font ligatures for logical symbols

If you use the [ArgVu](https://github.com/christianvoigt/argdown/tree/master/packages/ArgVu) font with Argdown code and activate the `dlig` font ligatures, the shortcodes for logical symbols will automatically be displayed as their unicode counterparts (so :A: will look like ∀ and :<->: will look like ↔), _without changing the underlying code_. This way you can "magically" enter logical symbols in an Argdown document without copy & paste.

You can try this out in the [Argdown Sandbox](https://argdown.org/sandbox) by clicking on "Use ArgVu font" above the code editor.
