import {EventEmitter} from "eventemitter3";
import {getTokenConstructor} from "chevrotain";


class ArgdownTreeWalker extends EventEmitter{
  walk(tree, config){
    this.visitNode(tree, null, null, config);
  }

  getTokenName(tokenInstance){
    let constr = getTokenConstructor(tokenInstance);
    return constr.tokenName;
  }

  visitNode(node, parentNode, childIndex, config){
    if(node.name){
      this.emit(node.name+'Entry', node, parentNode, childIndex, config);
    }else {
      this.emit(this.getTokenName(node) + 'Entry', node, parentNode, childIndex, config);
    }

    if(node.children && node.children.length > 0){
      for(var i = 0; i < node.children.length; i++){
        let child = node.children[i];
        this.visitNode(child, node, i, config);
      }
    }

    if(node.name){
      this.emit(node.name+'Exit', node, parentNode, childIndex, config);
    }else{
      this.emit(this.getTokenName(node) + 'Exit', node, parentNode, childIndex, config);
    }
  }

  capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
module.exports = {
  ArgdownTreeWalker: ArgdownTreeWalker
}
