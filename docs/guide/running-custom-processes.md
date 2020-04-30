---
title: Running custom processes
meta:
  - name: description
    content: How to define and run custom processes in your config file.
---

# Running custom processes

Using configuration options you can export very different views of the same data. While this is great, it can be tedious to constantly switch between different config files to export different argument maps. To avoid this, you can define several custom processes within the same configuration file. These processes will inherit all settings from the config file, but you can also add new settings that will only be applied if this custom process is run.

A custom process contains

- A process to run. You can define your [own process](/guide/loading-custom-plugins-in-a-config-file.html) or simply use one of the following built-in processes. Here are their names:
  - `export-svg`
  - `export-dot`
  - `export-pdf`
  - `export-json`
  - `export-html`
- Additional configuration settings.

Here is an example of a config file that defines two different custom processes for an Argdown document containing four headings **Section 1**, **Section 2**, **Section 3** and **Section 4**:

```javascript
module.exports{
    model: {
        removeTagsFromText: true
    },
    processes: {
        "map1": {
            inputPath: "my-debate.ad",
            outputSuffix: "-map1",
            process: "export-svg",
            selection: {
                selectedSections: ["Section 1", "Section 2"]
            },
            color: {
                colorScheme: "iwanthue-red-roses"
            }
        },
        "map2": {
            inputPath: "my-debate.ad",
            outputSuffix: "-map2",
            process: "export-svg",
            selectedSections: ["Section 1", "Section 3", "Section 4"],
            color: {
                colorScheme: "iwanthue-indigo-night"
            }
        }
    }
}
```

Note that we use the `outputSuffix` setting in both processes to give the two svg files different filenames (otherwise they would overwrite each other's files).

Now let's use the commandline tool to run these processes one after another:

```sh
argdown run map1 && argdown run map2
```

If everything goes according to plan, we now have two new files in the `./svg/` folder: `my-debate-map1.svg` and `my-debate-map2.svg`.

## Running custom processes in VS Code

The run command in the VS Code extension currently will not take a process name as a parameter (it would be nice to have this feature). Instead it relies on the `process` field in your config file. The downside of this is that you have to change your config file everytime you want to run a different process (the next section describes a workaround for this).

Let us look at how this works. First, we have to change the config file:

```javascript
module.exports = {
  model: {
    removeTagsFromText: true
  },
  process: "map1", // needed for VS Code run command
  processes: {
    map1: {
      inputPath: "my-debate.ad",
      outputSuffix: "-map1",
      process: "export-svg",
      selection: {
        selectedSections: ["Section 1", "Section 2"]
      },
      color: {
        colorScheme: "iwanthue-red-roses"
      }
    },
    map2: {
      inputPath: "my-debate.ad",
      outputSuffix: "-map2",
      process: "export-svg",
      selectedSections: ["Section 1", "Section 3", "Section 4"],
      color: {
        colorScheme: "iwanthue-indigo-night"
      }
    }
  }
};
```

- Now open the **command palette** in VS Code with `CTRL + Shift + P` (`CMD + Shift + P` on OSX) and type in "Run".
- Select the Argdown run command.

You should now have a `my-debate-map1.svg` file in your svg folder.

## Defining an Argdown task in VS Code

You can also use the commandline tool in VS Code to define [tasks](https://code.visualstudio.com/Docs/editor/tasks). Doing so you can export several maps at once:

- Install the commandline tool globally with `npm install -g @argdown/cli`.
- Now follow the [instructions](https://code.visualstudio.com/Docs/editor/tasks#_custom-tasks) on how to create a custom task.
- Paste the following into your `tasks.json` file:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Create my maps",
      "type": "shell",
      "command": "argdown run map1 && argdown run map2",
      "group": "build"
    }
  ]
}
```

Now you can run your custom task:

- Press `CTRL + Shift + P` (`CMD + Shift + P` on OSX) and enter "tasks".
- Select "Create my maps".

You should now have `my-debate-map1.svg` and `my-debate-map2.svg` in your svg folder.
