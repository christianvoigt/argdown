import * as _ from 'lodash';

class HtmlExport{
  set config(config){
    this.settings = _.defaults(config ||{}, {
      headless : false,
      cssFile: './argdown.css',
      title: 'Argdown Document',
      lang: 'en',
      charset: 'utf8'
    });

    this.head = "<!doctype html>\n\n"+
        "<html lang='"+this.settings.lang+"'>\n"+
        "<head>\n"+
        "<meta charset='"+this.settings.charset+"'>\n"+
        "<title>"+this.settings.title+"</title>\n";
        if(this.settings.cssFile){
            this.head += "<link rel='stylesheet' href='"+this.settings.cssFile+"'>\n";
        }
        this.head += "</head>";
  }
  run(result){
    result.html = this.html;
    return result;
  }
  constructor(config){
    this.name = "HtmlExport";
    this.html = "";
    let $ = this;
    this.config = config;

    this.argdownListeners = {
      argdownEntry : ()=>{
        if(!$.settings.headless){
          $.html = "";
          $.html += $.head;
          $.html += "<body>";
        }
        $.html += "<div class='argdown'>";
      },
      argdownExit : ()=>{
        if(!$.settings.headless){
          $.html += "</body></html>";
        }
      },
      statementEntry : ()=>$.html += "<div class='statement'>",
      statementExit : ()=>$.html += "</div>",
      StatementDefinitionEntry : (node)=>{
        $.html += "<span class='definition statement-definition definiendum'>[<span class='title statement-title'>"+node.statement.title+"</span>]: </span>"
      },
      StatementReferenceEntry : (node)=>{
        $.html += "<span class='reference statement-reference'>[<span class='title statement-title'>"+node.statement.title+"</span>] </span>"
      },
      StatementMentionEntry : (node)=>{
        $.html += "<span class='mention statement-mention'>@[<span class='title statement-title'>"+node.title+"</span>]</span>"+node.trailingWhitespace
      },
      argumentReferenceEntry : (node)=>{
        $.html += "<div class='argument-reference'>&lt;<span class='title argument-title'>"+node.argument.title+"</span>&gt; </div>"
      },
      argumentDefinitionEntry : (node)=>{
        $.html += "<div class='argument-definition'><span class='definiendum argument-definiendum'>&lt;<span class='title argument-title'>"+node.argument.title+"</span>&gt;: </span><span class='argument-definiens definiens description'>"
      },
      ArgumentMentionEntry : (node)=>{
        $.html += "<span class='mention argument-mention'>@&lt;<span class='title argument-title'>"+node.title+"</span>&gt;</span>"+node.trailingWhitespace
      },
      argumentDefinitionExit : ()=>$.html+="</span></div>",
      incomingSupportEntry : ()=>{
        $.html += "<div class='incoming support relation'><div class='incoming support relation-symbol'><span>+&gt;</span></div>"
      },
      incomingSupportExit : ()=>$.html += "</div>",
      incomingAttackEntry : ()=>{
        $.html += "<div class='incoming attack relation'><div class='incoming attack relation-symbol'><span>-&gt;</span></div>"
      },
      incomingAttackExit : ()=>$.html += "</div>",
      outgoingSupportEntry : ()=>{
        $.html += "<div class='outgoing support relation'><div class='outgoing support relation-symbol'><span>+</span></div>"
      },
      outgoingSupportExit : ()=>{
        $.html += "</div>"
      },
      outgoingAttackEntry : ()=>{
        $.html += "<div class='outgoing attack relation'><div class='outgoing attack relation-symbol'><span>-</span></div>"
      },
      outgoingAttackExit : ()=>{
        $.html += "</div>"
      },
      relationsEntry : ()=>{
        $.html += "<div class='relations'>";
      },
      relationsExit : ()=>{
        $.html += "</div>";
      },
      orderedListEntry : ()=>$.html += "<ol>",
      orderedListExit : ()=>$.html += "</ol>",
      unorderedListEntry : ()=>$.html += "<ul>",
      unorderedListExit : ()=>$.html += "</ul>",
      orderedListItemEntry : ()=>$.html += "<li>",
      orderedListItemExit : ()=>$.html += "</li>",
      unorderedListItemEntry : ()=>$.html += "<li>",
      unorderedListItemExit : ()=>$.html += "</li>",
      headingEntry : (node)=>{
        if(node.heading == 1){
          if($.settings.title == 'Argdown Document'){
            $.html = $.html.replace('<title>Argdown Document</title>','<title>'+node.text+'</title>')
          }
        }
        $.html += "<h"+node.heading+">"
      },
      headingExit : (node)=>$.html += "</h"+node.heading+">",
      freestyleTextEntry : (node, parentNode)=>{
        if(parentNode.name != 'inferenceRules' && parentNode.name != 'metadataStatement')
          $.html += node.text
      },
      boldEntry : ()=>$.html += "<b>",
      boldExit : (node)=>$.html += "</b>"+node.trailingWhitespace,
      italicEntry : ()=>$.html += "<i>",
      italicExit : (node)=>$.html += "</i>"+node.trailingWhitespace,
      LinkEntry : (node)=>$.html += "<a href='"+node.url+"'>"+node.text+"</a>"+node.trailingWhitespace,
      argumentEntry : ()=>$.html += "<div class='argument'>",
      argumentExit : ()=>$.html += "</div>",
      argumentStatementEntry : (node)=>{
        if(node.statement.role == 'conclusion'){
          let inference = node.statement.inference;
          let metadataKeys = Object.keys(inference.metaData);
          if(metadataKeys.length == 0 && inference.inferenceRules.length == 0){
            $.html += "<div class='inference'>";
          }else{
            $.html += "<div class='inference with-data'>";
          }

          $.html += "<span class='inference-rules'>"
          if(inference.inferenceRules.length > 0){
            let i = 0;
            for(let inferenceRule of inference.inferenceRules){
              if(i > 0)
                $.html += ", ";
              $.html += "<span class='inference-rule'>"+inferenceRule+"</span>";
              i++;
            }
            $.html += "</span> ";
          }
          if(metadataKeys.length > 0){
            $.html += "<span class='metadata'>(";
            for(let i = 0; i < metadataKeys.length; i++){
              let key = metadataKeys[i];
              $.html += "<span class='meta-data-statement'>";
              $.html += "<span class='meta-data-key'>"+key+": </span>";
              if(_.isString(inference.metaData[key])){
                $.html += "<span class='meta-data-value'>"+inference.metaData[key]+"</span>";
              }else{
                let j = 0;
                for(let value of inference.metaData[key]){
                  if(j > 0)
                    $.html += ", ";
                  $.html += "<span class='meta-data-value'>"+value+"</span>";
                  j++;
                }
              }
              if(i < metadataKeys.length - 1)
                $.html  += "; ";
              $.html += "</span>";
            }
            $.html += " )</span>";
          }

          $.html += "</div>";
        }
        $.html += "<div class='"+node.statement.role+" argument-statement'><div class='statement-nr'>(<span>"+node.statementNr+"</span>)</div>"
      },
      argumentStatementExit : ()=>$.html += "</div>"
    }
  }
}
module.exports = {
  HtmlExport: HtmlExport
}
