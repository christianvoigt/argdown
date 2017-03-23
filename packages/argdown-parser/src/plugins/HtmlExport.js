import * as _ from 'lodash';

class HtmlExport{
  constructor(){
    this.name = "HtmlExport";
    this.html = "";
    let $ = this;

    this.argdownListeners = {
      statementEntry : ()=>$.html += "<div class='statement'>",
      statementExit : ()=>$.html += "</div>",
      StatementDefinitionEntry : (node)=>{
        $.html += "<span class='statement definition definiendum'>[<span class='statement title'>"+node.statement.title+"</span>]:</span>"
      },
      StatementReferenceEntry : (node)=>{
        $.html += "<span class='statement reference'>[<span class='statement title'>"+node.statement.title+"</span>]</span>"
      },
      argumentReferenceEntry : (node)=>{
        $.html += "<div class='argument-reference'>&lt;<span class='title'>"+node.argument.title+"</span>&gt;:</div>"
      },
      argumentDefinitionEntry : (node)=>{
        $.html += "<div class='argument-definition'><span class='argument definiendum'>&lt;<span class='title'>"+node.argument.title+"</span>&gt;</span><span class='argument definiens description'>"
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
      orderedListEntry : ()=>$.html += "<ol>",
      orderedListExit : ()=>$.html += "</ol>",
      unorderedListEntry : ()=>$.html += "<ul>",
      unorderedListExit : ()=>$.html += "</ul>",
      orderedListItemEntry : ()=>$.html += "<li>",
      orderedListItemExit : ()=>$.html += "</li>",
      unorderedListItemEntry : ()=>$.html += "<li>",
      unorderedListItemExit : ()=>$.html += "</li>",
      headingEntry : (node)=>$.html += "<h"+node.heading+">",
      headingExit : (node)=>$.html += "</h"+node.heading+">",
      freestyleTextEntry : (node)=>$.html += node.text,
      boldEntry : ()=>$.html += "<b>",
      boldExit : ()=>$.html += "</b>",
      italicEntry : ()=>$.html += "<i>",
      italicExit : ()=>$.html += "</i>",
      LinkEntry : (node)=>$.html += "<a href='"+node.url+"'>"+node.text+"</a>",
      argumentEntry : ()=>$.html += "<div class='argument'>",
      argumentExit : ()=>$.html += "</div>",
      argumentStatementEnter : (node)=>{
        if(node.argumentStatement.role == 'conclusion'){
          let inference = node.argumentStatement.inference;
          $.html += "<div class='inference'>";
          $.html += "<span class='inference-rules'>"
          for(let inferenceRule of inference.inferenceRules){
            $.html += "<span class='inference-rule'>"+inferenceRule+"</span>";
          }
          $.html += "</span>";
          $.html += "<span class='metadata'>";
          for(let key of Object.keys(inference.metaData)){
            $.html += "<span class='meta-data-statement'>";
            $.html += "<span class='meta-data-key'>"+key+"</span>";
            if(_.isString(inference.metaData[key])){
              $.html += "<span class='meta-data-value'>"+inference.metaData[key]+"</span>";
            }else{
              let i = 0;
              for(let value of inference.metaData[key]){
                if(i > 0)
                  $.html += ", ";
                $.html += "<span class='meta-data-value'>"+value+"</span>";
                i++;
              }
            }
            $.html += "</span>";
          }
          $.html += "</span>";
          $.html += "</div>";
        }
        $.html += "<div class='"+node.argumentStatement.role+" argument statement'><div class='statement-nr'>"+node.statementNr+"</div>"
      },
      argumentStatementExit : ()=>$.html += "</div>"
    }
  }
}
module.exports = {
  HtmlExport: HtmlExport
}
