const fs = require("fs");

// destination.txt will be created or overwritten by default.
fs.copyFile(
  "./packages/argdown-web-components/dist/nomodule/argdown-map.js",
  "./docs/.vuepress/public/argdown-map.js",
  err => {
    if (err) throw err;
  }
);
fs.copyFile(
  "./packages/argdown-web-components/dist/nomodule/argdown-map.css",
  "./docs/.vuepress/public/argdown-map.css",
  err => {
    if (err) throw err;
  }
);
