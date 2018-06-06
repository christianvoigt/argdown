import { EventEmitter } from "eventemitter3";

class ArgdownTreeWalker extends EventEmitter {
  walk(request, response, logger) {
    this.visitNode(request, response, response.ast, null, null, logger);
  }

  getTokenName(tokenInstance) {
    return tokenInstance.tokenType.tokenName;
  }

  visitNode(request, response, node, parentNode, childIndex, logger) {
    if (node) {
      if (node.name) {
        this.emit(
          node.name + "Entry",
          request,
          response,
          node,
          parentNode,
          childIndex,
          logger
        );
      } else {
        this.emit(
          node.tokenType.tokenName + "Entry",
          request,
          response,
          node,
          parentNode,
          childIndex,
          logger
        );
      }

      if (node.children && node.children.length > 0) {
        for (var i = 0; i < node.children.length; i++) {
          let child = node.children[i];
          this.visitNode(request, response, child, node, i, logger);
        }
      }

      if (node.name) {
        this.emit(
          node.name + "Exit",
          request,
          response,
          node,
          parentNode,
          childIndex,
          logger
        );
      } else {
        this.emit(
          node.tokenType.tokenName + "Exit",
          request,
          response,
          node,
          parentNode,
          childIndex,
          logger
        );
      }
    }
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
module.exports = {
  ArgdownTreeWalker: ArgdownTreeWalker
};
