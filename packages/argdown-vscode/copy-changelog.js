const fs = require("fs");

// destination.txt will be created or overwritten by default.
fs.copyFile("../../docs/changes/README.md", "CHANGELOG.md", err => {
  if (err) throw err;
});
