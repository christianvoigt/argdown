'use strict';

import chevrotain,{Parser} from 'chevrotain';
import * as lexer from './ArgdownLexer.js';

class ArgdownParser extends chevrotain.Parser {

    constructor(input) {
        super(input, lexer.tokens);


    let $ = this;

    $.argdown = $.RULE("argdown", ()=>{
      let atLeastOne = $.AT_LEAST_ONE_SEP(lexer.Emptyline,()=>$.OR([
        {ALT: () => $.SUBRULE($.heading)},
        {ALT: () => $.SUBRULE($.statement)},
        {ALT: () => $.SUBRULE($.complexArgument)},
        {ALT: () => $.SUBRULE($.orderedList)},
        {ALT: () => $.SUBRULE($.unorderedList)}
      ]));
      return {name: 'argdown',
          children: atLeastOne.values
      };
    });

    $.heading = $.RULE("heading", ()=>{
      let children = [];
      children.push($.CONSUME(lexer.HeadingStart));
      children.push($.CONSUME(lexer.Freestyle));
      return {name:"heading",children:children};
    });
    $.complexArgument = $.RULE("complexArgument",()=>{
      let children = [];
      let atLeastOne = ($.AT_LEAST_ONE(()=>children.push($.SUBRULE($.simpleArgument))));
      children.concat(atLeastOne.values);
      return {name: "complexArgument", children: children};
    });
    $.simpleArgument = $.RULE("simpleArgument",()=>{
      let children = [];
      $.AT_LEAST_ONE(()=>children.push($.SUBRULE1($.argumentStatement)));
      children.push($.SUBRULE($.inference));
      children.push($.SUBRULE2($.argumentStatement));
      return {name: "simpleArgument", children: children};
    });
    $.argumentStatement = $.RULE("argumentStatement", ()=>{
      let children = [];
      children.push($.CONSUME(lexer.ArgumentStatementStart));
      children.push($.SUBRULE($.statement));
      return {name: "argumentStatement", children: children};
    });
    $.inference = $.RULE("inference", ()=>{
      let children = [];
      children.push($.CONSUME(lexer.InferenceStart));
      $.OPTION1(()=>{
        children.push($.SUBRULE($.inferenceRules));
      });
      $.OPTION2(()=>{
        children.push($.SUBRULE($.metadata));
      });
      children.push($.CONSUME(lexer.InferenceEnd));
      return {name: "inference", children: children};
    });
    $.inferenceRules = $.RULE("inferenceRules",()=>{
      let children = [];
      $.AT_LEAST_ONE_SEP1(lexer.ListDelimiter,()=>children.push($.CONSUME(lexer.Freestyle)));
      return {name:"inferenceRules",children:children};
    });
    $.metadata = $.RULE("metadata", ()=>{
      let children = [];
      children.push($.CONSUME(lexer.MetadataStart));
      $.AT_LEAST_ONE_SEP(lexer.MetadataStatementEnd,()=>children.push($.SUBRULE($.metadataStatement)));
      children.push($.CONSUME(lexer.MetadataEnd));
      return {name:"metadata", children:children};
    });
    $.metadataStatement = $.RULE("metadataStatement", ()=>{
      let children = [];
      children.push($.CONSUME1(lexer.Freestyle));
      children.push($.CONSUME(lexer.Colon));
      let atLeastOne = $.AT_LEAST_ONE_SEP(lexer.ListDelimiter,()=>$.CONSUME2(lexer.Freestyle));
      children.concat(atLeastOne.values);
      return {name: "metadataStatement", children: children};
    });

    $.list = $.RULE("orderedList", ()=>{
      let children = [];
      children.push($.CONSUME(lexer.Indent));
      $.AT_LEAST_ONE(() =>children.push($.SUBRULE($.orderedListItem)));
      children.push($.CONSUME(lexer.Dedent));
      return {name:'orderedList', children: children};
    });
    $.list = $.RULE("unorderedList", ()=>{
      let children = [];
      children.push($.CONSUME(lexer.Indent));
      $.AT_LEAST_ONE(() =>children.push($.SUBRULE($.unorderedListItem)));
      children.push($.CONSUME(lexer.Dedent));
      return {name:'unorderedList', children: children};
    });

    $.unorderedListItem = $.RULE("unorderedListItem",()=>{
      let children = [];
      children.push($.CONSUME(lexer.UnorderedListItem));
      children.push($.SUBRULE($.statement));
      return {name:"unorderedListItem", children:children};
    });
    $.orderedListItem = $.RULE("orderedListItem",()=>{
      let children = [];
      children.push($.CONSUME(lexer.OrderedListItem));
      children.push($.SUBRULE($.statement));
      return {name:"orderedListItem", children:children};
    });

    $.statement = $.RULE("statement", ()=>{
      let children = [];
      children[0] = $.OR([
        {ALT: () => $.SUBRULE1($.statementContent)},
        {ALT: () => $.CONSUME(lexer.StatementReference)},
        {ALT: () => {
          let children = [];
          children.push($.CONSUME(lexer.StatementDefinition));
          children.push($.SUBRULE2($.statementContent));
          return {name:"statementDefinition",children:children};
        }}
      ]);
      $.OPTION(()=>{children.push($.SUBRULE($.relations))});
      return {name:'statement', children: children};
    });

    $.relations = $.RULE("relations", ()=>{
      let children = [];
      children.push($.CONSUME(lexer.Indent));
      let atLeastOne = $.AT_LEAST_ONE(() =>$.OR([
            {ALT: () => $.SUBRULE($.incomingSupport)},
            {ALT: () => $.SUBRULE($.incomingAttack)},
            {ALT: () => $.SUBRULE($.outgoingSupport)},
            {ALT: () => $.SUBRULE($.outgoingAttack)}
        ]));
      children = children.concat(atLeastOne);
      children.push($.CONSUME(lexer.Dedent));
      return {name:'relations', children: children};
    });

    $.incomingSupport = $.RULE("incomingSupport", ()=>{
      let children = [];
      children.push($.CONSUME(lexer.IncomingSupport));
      children.push($.SUBRULE($.statement));
      return {name:'incomingSupport', children: children};
    });
    $.incomingAttack = $.RULE("incomingAttack", ()=>{
      let children = [];
      children.push($.CONSUME(lexer.IncomingAttack));
      children.push($.SUBRULE($.statement));
      return {name:'incomingAttack', children: children};
    });
    $.outgoingSupport = $.RULE("outgoingSupport", ()=>{
      let children = [];
      children.push($.CONSUME(lexer.OutgoingSupport));
      children.push($.SUBRULE($.statement));
      return {name:'outgoingSupport', children: children};
    });
    $.outgoingAttack = $.RULE("outgoingAttack", ()=>{
      let children = [];
      children.push($.CONSUME(lexer.OutgoingAttack));
      children.push($.SUBRULE($.statement));
      return {name:'outgoingAttack', children: children};
    });
    $.statementContent = $.RULE("statementContent", ()=>{
      let children = [];
      $.AT_LEAST_ONE(()=>$.OR([
            {ALT: () => children.push($.SUBRULE($.freestyleText))},
            {ALT: () => children.push($.CONSUME(lexer.Link))},
            {ALT: () => {
              children.push($.CONSUME(lexer.UnderscoreBoldStart));
              children.push($.SUBRULE1($.statementContent));
              children.push($.CONSUME(lexer.UnderscoreBoldEnd));
            }},
            {ALT: () => {
              children.push($.CONSUME(lexer.StarBoldStart));
              children.push($.SUBRULE2($.statementContent));
              children.push($.CONSUME(lexer.StarBoldEnd));
            }},
            {ALT: () => {
              children.push($.CONSUME(lexer.UnderscoreItalicStart));
              children.push($.SUBRULE3($.statementContent));
              children.push($.CONSUME(lexer.UnderscoreItalicEnd));
            }},
            {ALT: () => {
              children.push($.CONSUME(lexer.StarItalicStart));
              children.push($.SUBRULE4($.statementContent));
              children.push($.CONSUME(lexer.StarItalicEnd));
            }},
        ]));
        return {name:'statementContent', children: children};
      });

      $.freestyleText = $.RULE("freestyleText",()=>{
        let children = [];
        $.AT_LEAST_ONE(() =>$.OR([
              {ALT: () => children.push($.CONSUME(lexer.Freestyle))},
              {ALT: () => children.push($.CONSUME(lexer.UnusedControlChar))}
          ]));
        return {name:"freestyleText", children:children};
      });
    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    Parser.performSelfAnalysis(this);
  }



}

module.exports = {
  ArgdownParser: ArgdownParser
}
