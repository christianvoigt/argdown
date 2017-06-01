import * as _ from 'lodash';

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
  run(data){
    if(data.config){
      if(data.config.html){
        this.config = data.config.html;
      }
    }
    
    data.html = this.html;
    return data;
  }
  constructor(config){
    this.name = "HtmlExport";
    this.html = "";
    let $ = this;
    this.config = config;
    this.htmlIds = {};

    this.argdownListeners = {
      argdownEntry : (node, parentNode, childIndex, data)=>{
        if(data && data.config){
          if(data.config.html){
            $.config = data.config.html;
          }
        }
        data.config = data.config||{};
        $.tagsDictionary = {};
        if(data.tags){
          for(let tag of data.tags){
            const tagData = {cssClassName: $.getHtmlId("tag",tag,true)};
            if(data.config.tags){
              const index = _.findIndex(data.config.tags,{tag:tag});
              if(index > -1){
                tagData.index = index;
              }
            }
            $.tagsDictionary[tag] = tagData;
          }          
        }
        
        $.html = "";
        $.htmlIds = {};
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
          $.html += head;
          $.html += "<body>";
        }
        $.html += "<div class='argdown'>";
      },
      argdownExit : ()=>{
        if(!$.settings.headless){
          $.html += "</body></html>";
        }
      },
      statementEntry : (node)=>{
        let classes = "statement";
        if(node.equivalenceClass.tags){
          classes += " " + $.getCssClassesFromTags(node.equivalenceClass.tags);
        }        
        $.html += "<div class='"+classes+"'>";
      },
      statementExit : ()=>$.html += "</div>",
      StatementDefinitionEntry : (node, parentNode)=>{
        let htmlId = $.getHtmlId("statement", node.statement.title);
        $.htmlIds[htmlId] = node.statement;
        let classes = "definition statement-definition definiendum";
        if(parentNode.equivalenceClass && parentNode.equivalenceClass.tags){
          classes += " " + $.getCssClassesFromTags(parentNode.equivalenceClass.tags);          
        }
        $.html += "<span id='"+htmlId+"' class='"+classes+"'>[<span class='title statement-title'>"+node.statement.title+"</span>]: </span>"
      },
      StatementReferenceEntry : (node, parentNode)=>{
        let htmlId = $.getHtmlId("statement", node.statement.title, true);
        let classes = "reference statement-reference";
        if(parentNode.equivalenceClass && parentNode.equivalenceClass.tags){
          classes += " " + $.getCssClassesFromTags(parentNode.equivalenceClass.tags);          
        }
        $.html += "<a href='#"+htmlId+"' class='"+classes+"'>[<span class='title statement-title'>"+node.statement.title+"</span>] </a>"
      },
      StatementMentionEntry : (node, parentNode, childIndex, data)=>{
        const equivalenceClass = data.statements[node.title];
        let classes = "mention statement-mention";
        if(equivalenceClass.tags){
          classes += " " + $.getCssClassesFromTags(equivalenceClass.tags);
        }
        let htmlId = $.getHtmlId("statement", node.title, true);
        $.html += "<a href='#"+htmlId+"' class='"+classes+"'>@[<span class='title statement-title'>"+node.title+"</span>]</a>"+node.trailingWhitespace
      },
      argumentReferenceEntry : (node)=>{
        let htmlId = $.getHtmlId("argument", node.argument.title, true);
        let classes = "reference argument-reference";
        if(node.argument.tags){
          classes += " " + $.getCssClassesFromTags(node.argument.tags);
        }
        $.html += "<a href='#"+htmlId+"' class='"+classes+"'>&lt;<span class='title argument-title'>"+node.argument.title+"</span>&gt; </a>"
      },
      argumentDefinitionEntry : (node)=>{
        let htmlId = $.getHtmlId("argument", node.argument.title);
        $.htmlIds[htmlId] = node.argument;
        let classes = "definition argument-definition";
        if(node.argument.tags){
          classes += " " + $.getCssClassesFromTags(node.argument.tags);
        }
        $.html += "<div id='"+htmlId+"' class='"+classes+"'><span class='definiendum argument-definiendum'>&lt;<span class='title argument-title'>"+node.argument.title+"</span>&gt;: </span><span class='argument-definiens definiens description'>"
      },
      ArgumentMentionEntry : (node, parentNode, childIndex, data)=>{
        let htmlId = $.getHtmlId("argument", node.title, true);
        let classes = "mention argument-mention";
        const argument = data.arguments[node.title];
        if(argument.tags){
          classes += " " + $.getCssClassesFromTags(argument.tags);
        }
        $.html += "<a href='#"+htmlId+"' class='"+classes+"'>@&lt;<span class='title argument-title'>"+node.title+"</span>&gt;</a>"+node.trailingWhitespace
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
      contradictionEntry : ()=>{
        $.html += "<div class='contradiction relation'><div class='contradiction relation-symbol'><span>&gt;&lt;</span></div>"
      },
      contradictionExit : ()=>{
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
        let htmlId = $.getHtmlId("heading",node.text);
        $.htmlIds[htmlId] = node;
        $.html += "<h"+node.heading+" id='"+htmlId+"'>"
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
      TagEntry : (node)=>$.html += "<span class='tag "+$.getCssClassesFromTags([node.tag])+"'>"+node.text+"</span>",
      argumentEntry : (node)=>{
        let classes = "argument";
        if(node.argument.tags){
          classes += " " + $.getCssClassesFromTags(node.argument.tags);          
        }
        $.html += "<div class='"+classes+"'>";
      },
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
  getHtmlId(type, title, ignoreDuplicates){
    let id = type + "-" + title;
    id = id.toLowerCase();
    id = id.replace(/ä/g,"ae");
    id = id.replace(/ö/g,"oe");
    id = id.replace(/ü/g,"ue");
    id = id.replace(/ß/g,"ss");
    id = id.replace(/\s/g,"-");
    id = id.replace(/[^a-z0-9\-]/g,"");
    if(!ignoreDuplicates){
      let originalId = id;
      let i = 1;
      while(this.htmlIds && this.htmlIds[id]){
        i++;
        id = originalId + "-occurrence-" + i;
      }
    }
    return id;
  }
  getCssClassesFromTags(tags){
    let classes = "";
    let index = 0;
    for(let tag of tags){
      if(index > 0){
        classes += " ";
      }
      index++;
      const tagData = this.tagsDictionary[tag];
      classes += tagData.cssClassName;
      if(tagData.index != null && tagData.index > -1){
        classes += " tag"+tagData.index;
      }
    }
    return classes;
  }
  replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }  
  escapeRegExp(str) {
      return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  }  
}
module.exports = {
  HtmlExport: HtmlExport
}
