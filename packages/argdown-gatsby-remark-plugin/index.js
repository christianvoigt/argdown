const vfile = require("to-vfile");
const argdown = require("@argdown/remark-plugin");

module.exports = ({ markdownAST, markdownNode }, options) => {
  const file = vfile(markdownNode.fileAbsolutePath);

  return argdown(options)(markdownAST, file);
};
