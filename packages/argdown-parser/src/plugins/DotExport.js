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

    for(let statementKey of Object.keys(data.map.statementNodes)){
      let statement = data.statements[statementKey];
      let statementNode = data.map.statementNodes[statementKey];
      let label = "";
      if(this.settings.useHtmlLabels){
        label = "\"<h3 class='title'>"+this.escapeQuotesForDot(statementNode.title)+"</h3>";
        if(!this.settings.onlyTitlesInHtmlLabels){
          let lastMember = _.last(statement.members);
          if(lastMember){
            let text = lastMember.text;
            if(text)
              label += "<p>"+this.escapeQuotesForDot(text)+"</p>";
          }
        }
        label += "\"";
      }else{
        label = "\""+this.escapeQuotesForDot(statementNode.title)+"\"";
      }
      dot += "  "+statementNode.id + " [label="+label+", shape=\"box\", style=\"filled,rounded\", color=\"cornflowerblue\", fillcolor=\"white\", labelfontcolor=\"white\", type=\""+statementNode.type+"\"];\n";
    }

    let argumentsKeys = Object.keys(data.map.argumentNodes);
    if(argumentsKeys.length > 0)
      dot += "\n\n";

    for(let key of argumentsKeys){
      let argument = data.arguments[key];
      let argumentNode = data.map.argumentNodes[key];
      let label = "";
      if(this.settings.useHtmlLabels){
        label = "\"<h3 class='title'>"+this.escapeQuotesForDot(argumentNode.title)+"</h3>";
        if(!this.settings.onlyTitlesInHtmlLabels){
          let lastDescription = _.last(argument.descriptions);
          if(lastDescription){
            let text = lastDescription.text;
            if(text)
              label += "<p>"+this.escapeQuotesForDot(text)+"</p>";
          }
        }
        label += "\"";
      }else{
        label = "\""+this.escapeQuotesForDot(argumentNode.title)+"\"";
      }
      dot += "  "+argumentNode.id + " [label="+label+", shape=\"box\", style=\"filled,rounded\", fillcolor=\"blue\", fontcolor=\"white\", type=\""+argumentNode.type+"\"];\n";
    }

    dot +="\n\n";

    for(let nodeRelation of data.map.relations){
      let color = "green";
      if(nodeRelation.type == "attack"){
        color = "red";
      }
      dot += "  "+nodeRelation.from.id + " -> " + nodeRelation.to.id + " [color=\""+color+"\", type=\""+nodeRelation.type+"\"];\n";
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
