'use strict';

import chevrotain,{Parser} from 'chevrotain';
import * as lexer from './ArgdownLexer.js';

class ArgdownParser extends chevrotain.Parser {

    constructor(input) {
        super(input, lexer.tokens, {outputCst : true});


    let $ = this;

    $.argdown = $.RULE("argdown", ()=>{
      $.AT_LEAST_ONE_SEP({
        SEP: lexer.Emptyline,
        DEF: ()=>$.OR({
          NAME: "$argdownOr",
          DEF:[
            {ALT: () => $.SUBRULE($.heading)},
            {ALT: () => $.SUBRULE($.statement)},
            {ALT: () => $.SUBRULE($.complexArgument)},
            {ALT: () => $.SUBRULE($.orderedList)},
            {ALT: () => $.SUBRULE($.unorderedList)}
          ]
        })
      });
    });

    $.heading = $.RULE("heading", ()=>{
      $.CONSUME(lexer.HeadingStart);
      $.CONSUME(lexer.Freestyle);
    });
    $.complexArgument = $.RULE("complexArgument",()=>{
      $.AT_LEAST_ONE(()=>$.SUBRULE($.simpleArgument));
    });
    $.simpleArgument = $.RULE("simpleArgument",()=>{
      $.AT_LEAST_ONE(()=>$.SUBRULE1($.argumentStatement));
      $.SUBRULE($.inference);
      $.SUBRULE2($.argumentStatement);
    });
    $.argumentStatement = $.RULE("argumentStatement", ()=>{
      $.CONSUME(lexer.ArgumentStatementStart);
      $.SUBRULE($.statement);
    });
    $.inference = $.RULE("inference", ()=>{
      $.CONSUME(lexer.InferenceStart);
      $.OPTION1(()=>{
        $.SUBRULE($.inferenceRules);
      });
      $.OPTION2(()=>{
        $.SUBRULE($.metadata);
      });
      $.CONSUME(lexer.InferenceEnd);
    });
    $.inferenceRules = $.RULE("inferenceRules",()=>{
      $.AT_LEAST_ONE_SEP1({
        SEP: lexer.ListDelimiter,
        DEF: ()=>$.CONSUME(lexer.Freestyle)
      });
    });
    $.metadata = $.RULE("metadata", ()=>{
      $.CONSUME(lexer.MetadataStart);
      $.AT_LEAST_ONE_SEP({
        SEP: lexer.MetadataStatementEnd,
        DEF: ()=>$.SUBRULE($.metadataStatement)
      });
    });
    $.metadataStatement = $.RULE("metadataStatement", ()=>{
      $.CONSUME1(lexer.Freestyle);
      $.CONSUME(lexer.Colon);
      $.AT_LEAST_ONE_SEP({
        SEP: lexer.ListDelimiter,
        DEF: ()=>$.CONSUME2(lexer.Freestyle)
      });
    });

    $.list = $.RULE("orderedList", ()=>{
      $.CONSUME(lexer.Indent);
      $.AT_LEAST_ONE(() =>$.SUBRULE($.orderedListItem));
      $.CONSUME(lexer.Dedent);
    });
    $.list = $.RULE("unorderedList", ()=>{
      $.CONSUME(lexer.Indent);
      $.AT_LEAST_ONE(() =>$.SUBRULE($.unorderedListItem));
      $.CONSUME(lexer.Dedent);
    });

    $.unorderedListItem = $.RULE("unorderedListItem",()=>{
      $.CONSUME(lexer.UnorderedListItem);
      $.SUBRULE($.statement);
    });
    $.orderedListItem = $.RULE("orderedListItem",()=>{
      $.CONSUME(lexer.OrderedListItem);
      $.SUBRULE($.statement);
    });

    $.statement = $.RULE("statement", ()=>{
      $.OR([
        {ALT: () => $.SUBRULE1($.statementContent)},
        {ALT: () => $.CONSUME(lexer.StatementReference)},
        {ALT: () => {
          $.CONSUME(lexer.StatementDefinition);
          $.SUBRULE2($.statementContent);
        }}
      ]);
      $.OPTION(()=>{$.SUBRULE($.relations)});
    });

    $.relations = $.RULE("relations", ()=>{
      $.CONSUME(lexer.Indent);
      $.AT_LEAST_ONE(() =>$.OR([
            {ALT: () => $.SUBRULE($.incomingSupport)},
            {ALT: () => $.SUBRULE($.incomingAttack)},
            {ALT: () => $.SUBRULE($.outgoingSupport)},
            {ALT: () => $.SUBRULE($.outgoingAttack)}
        ]));
      $.CONSUME(lexer.Dedent);
    });

    $.incomingSupport = $.RULE("incomingSupport", ()=>{
      $.CONSUME(lexer.IncomingSupport);
      $.SUBRULE($.statement);
    });
    $.incomingAttack = $.RULE("incomingAttack", ()=>{
      $.CONSUME(lexer.IncomingAttack);
      $.SUBRULE($.statement);
    });
    $.outgoingSupport = $.RULE("outgoingSupport", ()=>{
      $.CONSUME(lexer.OutgoingSupport);
      $.SUBRULE($.statement);
    });
    $.outgoingAttack = $.RULE("outgoingAttack", ()=>{
      $.CONSUME(lexer.OutgoingAttack);
      $.SUBRULE($.statement);
    });
    $.statementContent = $.RULE("statementContent", ()=>{
      $.AT_LEAST_ONE(()=>$.OR([
            {ALT: () => $.SUBRULE($.freestyleText)},
            {ALT: () => $.CONSUME(lexer.Link)},
            {ALT: () => {
              $.CONSUME(lexer.UnderscoreBoldStart);
              $.SUBRULE1($.statementContent);
              $.CONSUME(lexer.UnderscoreBoldEnd);
            }},
            {ALT: () => {
              $.CONSUME(lexer.StarBoldStart);
              $.SUBRULE2($.statementContent);
              $.CONSUME(lexer.StarBoldEnd);
            }},
            {ALT: () => {
              $.CONSUME(lexer.UnderscoreItalicStart);
              $.SUBRULE3($.statementContent);
              $.CONSUME(lexer.UnderscoreItalicEnd);
            }},
            {ALT: () => {
              $.CONSUME(lexer.StarItalicStart);
              $.SUBRULE4($.statementContent);
              $.CONSUME(lexer.StarItalicEnd);
            }},
        ]));
      });

      $.freestyleText = $.RULE("freestyleText",()=>{
        $.AT_LEAST_ONE(() =>$.OR([
              {ALT: () => $.CONSUME(lexer.Freestyle)},
              {ALT: () => $.CONSUME(lexer.UnusedControlChar)}
          ]));
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
