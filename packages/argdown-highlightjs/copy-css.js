const fs = require("fs");

// destination.txt will be created or overwritten by default.
fs.copyFile(
  "./src/snow-in-spring.argdown-theme.css",
  "./dist/snow-in-spring.argdown-theme.css",
  err => {
    if (err) throw err;
  }
);
fs.copyFile(
  "./src/snow-in-spring.argdown-theme.css",
  "./dist-esm/snow-in-spring.argdown-theme.css",
  err => {
    if (err) throw err;
  }
);
