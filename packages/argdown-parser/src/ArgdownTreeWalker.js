import {EventEmitter} from "eventemitter3";
import {getTokenConstructor} from "chevrotain";


class ArgdownTreeWalker extends EventEmitter{
  walk(tree, data, logger){
    this.visitNode(tree, null, null, data);
  }

  getTokenName(tokenInstance){
    return tokenInstance.tokenType.tokenName;
  }

  visitNode(node, parentNode, childIndex, data, logger){
    if(node){
      if(node.name){
        this.emit(node.name+'Entry', node, parentNode, childIndex, data, logger);
      }else {
        this.emit(node.tokenType.tokenName + 'Entry', node, parentNode, childIndex, data, logger);
      }

      if(node.children && node.children.length > 0){
        for(var i = 0; i < node.children.length; i++){
          let child = node.children[i];
          this.visitNode(child, node, i, data, logger);
        }
      }

      if(node.name){
        this.emit(node.name+'Exit', node, parentNode, childIndex, data, logger);
      }else{
        this.emit(node.tokenType.tokenName + 'Exit', node, parentNode, childIndex, data, logger);
      }
    }
  }

  capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
module.exports = {
  ArgdownTreeWalker: ArgdownTreeWalker
}
