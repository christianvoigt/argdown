import * as _ from 'lodash';

class DotExport{
  set config(config){
    this.settings = _.defaults(config ||{}, {
      useHtmlLabels : false,
      onlyTitlesInHtmlLabels: false,
      graphname: 'Argument Map',
    });
  }
  constructor(){
    this.name = "DotExport";
  }
  run(data){
    let dot = "digraph \""+this.settings.graphname+"\" {\n\n";

    for(let node of data.map.nodes){
      let element;
      if(node.type == "statement"){
        element = data.statements[node.title];
      }else{
        element = data.arguments[node.title];
      }
      let label = "";
      if(this.settings.useHtmlLabels){
        label = "\"<h3 class='title'>"+this.escapeQuotesForDot(node.title)+"</h3>";
        if(!this.settings.onlyTitlesInHtmlLabels){
          let lastMember;
          if(node.type == "statement"){
            lastMember = _.last(element.members);
          }else{
            lastMember = _.last(element.descriptions);
          }
          if(lastMember){
            let text = lastMember.text;
            if(text)
              label += "<p>"+this.escapeQuotesForDot(text)+"</p>";
          }
        }
        label += "\"";
      }else{
        label = "\""+this.escapeQuotesForDot(node.title)+"\"";
      }
      if(node.type == "statement"){
        dot += "  "+node.id + " [label="+label+", shape=\"box\", style=\"filled,rounded\", color=\"cornflowerblue\", fillcolor=\"white\", labelfontcolor=\"white\", type=\""+node.type+"\"];\n";
      }else{
        dot += "  "+node.id + " [label="+label+", shape=\"box\", style=\"filled,rounded\", fillcolor=\"blue\", fontcolor=\"white\", type=\""+node.type+"\"];\n";
      }
    }

    dot +="\n\n";

    for(let edge of data.map.edges){
      let color = "green";
      if(edge.type == "attack"){
        color = "red";
      }
      dot += "  "+edge.from.id + " -> " + edge.to.id + " [color=\""+color+"\", type=\""+edge.type+"\"];\n";
    }

    dot += "\n}";

    data.dot = dot;
    return data;
  }
  escapeQuotesForDot(str){
    return str.replace(/\"/g,'\\\"');
  }
}
module.exports = {
  DotExport: DotExport
}
