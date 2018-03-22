import * as _ from 'lodash';
import util from './util.js';

class HtmlExport{
  set config(config){
    let previousSettings = this.settings;
    if(!previousSettings){
      previousSettings = {
        headless : false,
        cssFile: './argdown.css',
        title: 'Argdown Document',
        lang: 'en',
        charset: 'utf8'
      }
    }
    this.settings = _.defaultsDeep({}, config, previousSettings);
  }
  run(request, response){
    if(request){
      if(request.html){
        this.config = request.html;
      }
    }    
    return response;
  }
  constructor(config){
    this.name = "HtmlExport";
    this.html = "";
    let $ = this;
    this.config = config;
    this.argdownListeners = {
      argdownEntry : (request, response)=>{
        if(request.html){
          $.config = request.html;
        }
        
        response.html = "";
        response.htmlIds = {};
        if(!$.settings.headless){
          let head = $.settings.head;
          if(!head){
            head = "<!doctype html>\n\n"+
                    "<html lang='"+$.settings.lang+"'>\n"+
                    "<head>\n"+
                    "<meta charset='"+$.settings.charset+"'>\n"+
                    "<title>"+$.settings.title+"</title>\n";
                    if($.settings.cssFile){
                        head += "<link rel='stylesheet' href='"+$.settings.cssFile+"'>\n";
                    }
                    head += "</head>";        
          }
          response.html += head;
          response.html += "<body>";
        }
        response.html += "<div class='argdown'>";
      },
      argdownExit : (request, response)=>{
        response.html += "</div>";
        if(!$.settings.headless){
          response.html += "</body></html>";
        }
      },
      statementEntry : (request, response, node)=>{
        let classes = "statement";
        if(node.equivalenceClass.tags){
          classes += " " + $.getCssClassesFromTags(response, node.equivalenceClass.sortedTags);
        }        
        response.html += "<div class='"+classes+"'>";
      },
      statementExit: (request, response)=>response.html += "</div>",
      StatementDefinitionEntry : (request, response, node, parentNode)=>{
        let htmlId = $.getHtmlId(response, "statement", node.statement.title);
        response.htmlIds[htmlId] = node.statement;
        let classes = "definition statement-definition definiendum";
        if(parentNode.equivalenceClass && parentNode.equivalenceClass.sortedTags){
          classes += " " + $.getCssClassesFromTags(response, parentNode.equivalenceClass.sortedTags);          
        }
        response.html += "<span id='"+htmlId+"' class='"+classes+"'>[<span class='title statement-title'>"+$.escapeHtml(node.statement.title)+"</span>]: </span>"
      },
      StatementReferenceEntry : (request, response, node, parentNode)=>{
        let htmlId = $.getHtmlId(response, "statement", node.statement.title, true);
        let classes = "reference statement-reference";
        if(parentNode.equivalenceClass && parentNode.equivalenceClass.sortedTags){
          classes += " " + $.getCssClassesFromTags(response, parentNode.equivalenceClass.sortedTags);          
        }
        response.html += "<a href='#"+htmlId+"' class='"+classes+"'>[<span class='title statement-title'>"+$.escapeHtml(node.statement.title)+"</span>] </a>"
      },
      StatementMentionEntry : (request, response, node)=>{
        const equivalenceClass = response.statements[node.title];
        let classes = "mention statement-mention";
        if(equivalenceClass.sortedTags){
          classes += " " + $.getCssClassesFromTags(response, equivalenceClass.sortedTags);
        }
        let htmlId = $.getHtmlId(response, "statement", node.title, true);
        response.html += "<a href='#"+htmlId+"' class='"+classes+"'>@[<span class='title statement-title'>"+$.escapeHtml(node.title)+"</span>]</a>"+node.trailingWhitespace
      },
      argumentReferenceEntry : (request, response, node)=>{
        let htmlId = $.getHtmlId(response, "argument", node.argument.title, true);
        let classes = "reference argument-reference";
        if(node.argument.tags){
          classes += " " + $.getCssClassesFromTags(response, node.argument.sortedTags);
        }
        response.html += "<a href='#"+htmlId+"' class='"+classes+"'>&lt;<span class='title argument-title'>"+$.escapeHtml(node.argument.title)+"</span>&gt; </a>"
      },
      argumentDefinitionEntry : (request, response, node)=>{
        let htmlId = $.getHtmlId(response, "argument", node.argument.title);
        response.htmlIds[htmlId] = node.argument;
        let classes = "definition argument-definition";
        if(node.argument.tags){
          classes += " " + $.getCssClassesFromTags(response, node.argument.sortedTags);
        }
        response.html += "<div id='"+htmlId+"' class='"+classes+"'><span class='definiendum argument-definiendum'>&lt;<span class='title argument-title'>"+$.escapeHtml(node.argument.title)+"</span>&gt;: </span><span class='argument-definiens definiens description'>"
      },
      ArgumentMentionEntry : (request, response, node)=>{
        let htmlId = $.getHtmlId(response, "argument", node.title, true);
        let classes = "mention argument-mention";
        const argument = response.arguments[node.title];
        if(argument.tags){
          classes += " " + $.getCssClassesFromTags(response, argument.sortedTags);
        }
        response.html += "<a href='#"+htmlId+"' class='"+classes+"'>@&lt;<span class='title argument-title'>"+$.escapeHtml(node.title)+"</span>&gt;</a>"+node.trailingWhitespace
      },
      argumentDefinitionExit: (request, response)=>response.html+="</span></div>",
      incomingSupportEntry: (request, response)=>{
        response.html += "<div class='incoming support relation'><div class='incoming support relation-symbol'><span>+&gt;</span></div>"
      },
      incomingSupportExit: (request, response)=>response.html += "</div>",
      incomingAttackEntry: (request, response)=>{
        response.html += "<div class='incoming attack relation'><div class='incoming attack relation-symbol'><span>-&gt;</span></div>"
      },
      incomingAttackExit: (request, response)=>response.html += "</div>",
      incomingUndercutEntry: (request, response) => {
        response.html += "<div class='incoming undercut relation'><div class='incoming undercut relation-symbol'><span>_&gt;</span></div>"
      },
      incomingUndercutExit: (request, response) => response.html += "</div>",
      outgoingSupportEntry: (request, response)=>{
        response.html += "<div class='outgoing support relation'><div class='outgoing support relation-symbol'><span>+</span></div>"
      },
      outgoingSupportExit: (request, response)=>{
        response.html += "</div>"
      },
      outgoingAttackEntry: (request, response)=>{
        response.html += "<div class='outgoing attack relation'><div class='outgoing attack relation-symbol'><span>-</span></div>"
      },
      outgoingAttackExit: (request, response)=>{
        response.html += "</div>"
      },
      outgoingUndercutEntry: (request, response) => {
        response.html += "<div class='outgoing undercut relation'><div class='outgoing undercut relation-symbol'><span>&lt;_</span></div>"
      },
      outgoingUndercutExit: (request, response) => {
        response.html += "</div>"
      },
      contradictionEntry: (request, response)=>{
        response.html += "<div class='contradiction relation'><div class='contradiction relation-symbol'><span>&gt;&lt;</span></div>"
      },
      contradictionExit: (request, response)=>{
        response.html += "</div>"
      },
      relationsEntry: (request, response)=>{
        response.html += "<div class='relations'>";
      },
      relationsExit: (request, response)=>{
        response.html += "</div>";
      },
      orderedListEntry: (request, response)=>response.html += "<ol>",
      orderedListExit: (request, response)=>response.html += "</ol>",
      unorderedListEntry: (request, response)=>response.html += "<ul>",
      unorderedListExit: (request, response)=>response.html += "</ul>",
      orderedListItemEntry: (request, response)=>response.html += "<li>",
      orderedListItemExit: (request, response)=>response.html += "</li>",
      unorderedListItemEntry: (request, response)=>response.html += "<li>",
      unorderedListItemExit: (request, response)=>response.html += "</li>",
      headingEntry : (request, response, node)=>{
        if(node.level == 1){
          if($.settings.title == 'Argdown Document'){
            response.html = response.html.replace('<title>Argdown Document</title>','<title>'+$.escapeHtml(node.text)+'</title>')
          }
        }
        let htmlId = $.getHtmlId(response, "heading",node.text);
        response.htmlIds[htmlId] = node;
        response.html += "<h"+node.level+" id='"+htmlId+"'>"
      },
      headingExit : (request, response, node)=>response.html += "</h"+node.level+">",
      freestyleTextEntry : (request, response, node, parentNode)=>{
        if(parentNode.name != 'inferenceRules' && parentNode.name != 'metadataStatement'){
          response.html += $.escapeHtml(node.text);
        }
      },
      boldEntry: (request, response)=>response.html += "<b>",
      boldExit: (request, response, node)=>response.html += "</b>"+node.trailingWhitespace,
      italicEntry: (request, response)=>response.html += "<i>",
      italicExit: (request, response, node)=>response.html += "</i>"+node.trailingWhitespace,
      LinkEntry: (request, response, node)=>response.html += "<a href='"+node.url+"'>"+node.text+"</a>"+node.trailingWhitespace,
      TagEntry: (request, response, node) => { if (node.text) { response.html += "<span class='tag " + $.getCssClassesFromTags(response, [node.tag])+"'>"+$.escapeHtml(node.text)+"</span>"}},
      argumentEntry : (request, response, node)=>{
        let classes = "argument";
        if(node.argument.tags){
          classes += " " + $.getCssClassesFromTags(response, node.argument.sortedTags);          
        }
        response.html += "<div class='"+classes+"'>";
      },
      argumentExit: (request, response)=>response.html += "</div>",
      argumentStatementEntry: (request, response, node)=>{
        if(node.statement.role == 'conclusion'){
          let inference = node.statement.inference;
          let metadataKeys = Object.keys(inference.metaData);
          if(metadataKeys.length == 0 && inference.inferenceRules.length == 0){
            response.html += "<div class='inference'>";
          }else{
            response.html += "<div class='inference with-data'>";
          }

          response.html += "<span class='inference-rules'>"
          if(inference.inferenceRules.length > 0){
            let i = 0;
            for(let inferenceRule of inference.inferenceRules){
              if(i > 0)
                response.html += ", ";
              response.html += "<span class='inference-rule'>"+inferenceRule+"</span>";
              i++;
            }
            response.html += "</span> ";
          }
          if(metadataKeys.length > 0){
            response.html += "<span class='metadata'>(";
            for(let i = 0; i < metadataKeys.length; i++){
              let key = metadataKeys[i];
              response.html += "<span class='meta-data-statement'>";
              response.html += "<span class='meta-data-key'>"+key+": </span>";
              if(_.isString(inference.metaData[key])){
                response.html += "<span class='meta-data-value'>"+$.escapeHtml(inference.metaData[key])+"</span>";
              }else{
                let j = 0;
                for(let value of inference.metaData[key]){
                  if(j > 0)
                    response.html += ", ";
                  response.html += "<span class='meta-data-value'>"+$.escapeHtml(value)+"</span>";
                  j++;
                }
              }
              if(i < metadataKeys.length - 1)
                response.html  += "; ";
              response.html += "</span>";
            }
            response.html += " )</span>";
          }

          response.html += "</div>";
        }
        response.html += "<div class='"+node.statement.role+" argument-statement'><div class='statement-nr'>(<span>"+node.statementNr+"</span>)</div>"
      },
      argumentStatementExit: (request, response)=>response.html += "</div>"
    }
  }
  getHtmlId(response, type, title, ignoreDuplicates){
    let id = type + "-" + title;
    id = util.getHtmlId(id);
    if(!ignoreDuplicates){
      let originalId = id;
      let i = 1;
      while(response.htmlIds && response.htmlIds[id]){
        i++;
        id = originalId + "-occurrence-" + i;
      }
    }
    return id;
  }
  getCssClassesFromTags(response, tags){
    let classes = "";
    if(!tags || !response.tagsDictionary){
      return classes;
    }
    let index = 0;
    for(let tag of tags){
      if(index > 0){
        classes += " ";
      }
      index++;
      const tagData = response.tagsDictionary[tag];
      classes += tagData.cssClass;
    }
    return classes;
  }
  replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }  
  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  escapeRegExp(str) {
      return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  }  
}
module.exports = {
  HtmlExport: HtmlExport
}
