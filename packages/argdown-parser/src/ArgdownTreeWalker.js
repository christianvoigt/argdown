import {EventEmitter} from "eventemitter3";


class ArgdownTreeWalker extends EventEmitter{
  walk(tree){
    this.visitNode(tree);
  }

  visitNode(node, parentNode, childIndex){
    if(node.name){
      this.emit(node.name+'Entry', node, parentNode, childIndex);
    }else {
      this.emit(node.constructor.name + 'Entry', node, parentNode, childIndex);
    }

    if(node.children && node.children.length > 0){
      for(var i = 0; i < node.children.length; i++){
        let child = node.children[i];
        this.visitNode(child, node, i);
      }
    }

    if(node.name){
      this.emit(node.name+'Exit', node, parentNode, childIndex);
    }else{
      this.emit(node.constructor.name + 'Exit', node, parentNode, childIndex);
    }
  }

  capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
module.exports = {
  ArgdownTreeWalker: ArgdownTreeWalker
}
