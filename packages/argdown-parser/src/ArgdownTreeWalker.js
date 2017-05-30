import {EventEmitter} from "eventemitter3";
import {getTokenConstructor} from "chevrotain";


class ArgdownTreeWalker extends EventEmitter{
  walk(tree, data){
    this.visitNode(tree, null, null, data);
  }

  getTokenName(tokenInstance){
    let constr = getTokenConstructor(tokenInstance);
    return constr.tokenName;
  }

  visitNode(node, parentNode, childIndex, data){
    if(node.name){
      this.emit(node.name+'Entry', node, parentNode, childIndex, data);
    }else {
      this.emit(this.getTokenName(node) + 'Entry', node, parentNode, childIndex, data);
    }

    if(node.children && node.children.length > 0){
      for(var i = 0; i < node.children.length; i++){
        let child = node.children[i];
        this.visitNode(child, node, i, data);
      }
    }

    if(node.name){
      this.emit(node.name+'Exit', node, parentNode, childIndex, data);
    }else{
      this.emit(this.getTokenName(node) + 'Exit', node, parentNode, childIndex, data);
    }
  }

  capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
module.exports = {
  ArgdownTreeWalker: ArgdownTreeWalker
}
