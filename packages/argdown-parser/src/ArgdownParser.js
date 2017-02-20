'use strict';

import chevrotain,{Parser} from 'chevrotain';
import * as lexer from './ArgdownLexer.js';

class ArgdownParser extends chevrotain.Parser {

    constructor(input) {
        super(input, lexer.tokens);

    let $ = this;

    $.statements = $.RULE("statements", ()=>{
      let many = $.MANY_SEP(lexer.Emptyline,()=>{
        return $.SUBRULE($.statement);
      });
      return {name: 'statements',
          children: many.values
      };
    });

    $.relations = $.RULE("relations", ()=>{
      let children = [];
      children.push($.CONSUME(lexer.Indent));
      let manyResult = $.MANY(() =>$.OR([
            {ALT: () => $.SUBRULE($.incomingSupport)},
            {ALT: () => $.SUBRULE($.incomingAttack)},
            {ALT: () => $.SUBRULE($.outgoingSupport)},
            {ALT: () => $.SUBRULE($.outgoingAttack)}
        ]));
      children = children.concat(manyResult);
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

    $.statement = $.RULE("statement", ()=>{
      let children = [];
      children[0] = $.OR([
        {ALT: () => $.SUBRULE1($.statementContent)},
        {ALT: () => $.CONSUME(lexer.StatementReference)},
        {ALT: () => {
          let children = [];
          children.push($.CONSUME(lexer.StatementDefinition));
          children.push($.SUBRULE2($.statementContent));
          return children;
        }}
      ]);
      $.OPTION(()=>{children.push($.SUBRULE($.relations))});
      return {name:'statement', children: children};
    });

    $.statementContent = $.RULE("statementContent", ()=>{
      let children = $.MANY(()=>$.CONSUME(lexer.Freestyle));
      return {name:'statementContent', children: children};
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
