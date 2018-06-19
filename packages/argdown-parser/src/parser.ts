"use strict";

import chevrotain, { Parser, IToken } from "chevrotain";
import * as lexer from "./lexer";
import { ArgdownErrorMessageProvider } from "./ArgdownErrorMessageProvider";
import { IAstNode, ArgdownTypes } from "./model/model";
import { createRuleNode, isTokenNode, isRuleNode } from "./model/model-utils";
import { RuleNames } from "./RuleNames";

class ArgdownParser extends chevrotain.Parser {
  constructor() {
    super([], lexer.tokenList, {
      errorMessageProvider: new ArgdownErrorMessageProvider(),
      recoveryEnabled: true
    });
    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    Parser.performSelfAnalysis(this);
  }
  //caches
  private c1: any;
  private c2: any;
  private c3: any;

  public argdown = this.RULE<IAstNode>(RuleNames.ARGDOWN, () => {
    this.OPTION1(() => {
      this.CONSUME1(lexer.Emptyline);
    });
    const children: IAstNode[] = [];
    this.OPTION2(() => {
      children.push(this.CONSUME2(lexer.FrontMatter));
      this.CONSUME2(lexer.Emptyline);
    });
    // OR caching. see: http://sap.github.io/chevrotain/docs/FAQ.html#major-performance-benefits
    let atLeastOne = this.AT_LEAST_ONE_SEP<IAstNode>({
      SEP: lexer.Emptyline,
      DEF: () =>
        this.OR(
          this.c1 ||
            (this.c1 = [
              {
                ALT: () => this.SUBRULE(this.heading)
              },
              {
                ALT: () => this.SUBRULE(this.statement)
              },
              {
                ALT: () => this.SUBRULE(this.pcs)
              },
              {
                ALT: () => this.SUBRULE(this.argumentDefinition)
              },
              {
                ALT: () => this.SUBRULE(this.argumentReference)
              },
              {
                ALT: () => this.SUBRULE(this.orderedList)
              },
              {
                ALT: () => this.SUBRULE(this.unorderedList)
              }
            ])
        )
    });
    children.push(...atLeastOne.values);

    return createRuleNode(RuleNames.ARGDOWN, children);
  });

  private heading = this.RULE(RuleNames.HEADING, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME1(lexer.HeadingStart));
    this.AT_LEAST_ONE({
      DEF: () => children.push(this.SUBRULE(this.statementContent))
    });
    this.OPTION(() => {
      children.push(this.CONSUME2(lexer.MetaData));
    });
    return createRuleNode(RuleNames.HEADING, children);
  });
  private pcs = this.RULE<IAstNode>(RuleNames.PCS, () => {
    let children: IAstNode[] = [];
    children.push(this.SUBRULE1<IAstNode>(this.argumentStatement));
    this.AT_LEAST_ONE({
      DEF: () => {
        children.push(this.SUBRULE2<IAstNode>(this.pcsTail));
      }
    });
    return createRuleNode(RuleNames.PCS, children);
  });
  private pcsTail = this.RULE(RuleNames.PCS_TAIL, () => {
    let children: IAstNode[] = [];
    this.MANY({
      DEF: () => {
        children.push(this.SUBRULE1<IAstNode>(this.argumentStatement));
      }
    });
    children.push(this.SUBRULE2<IAstNode>(this.inference));
    children.push(this.SUBRULE3<IAstNode>(this.argumentStatement));
    return createRuleNode(RuleNames.PCS_TAIL, children);
  });
  private argumentStatement = this.RULE<IAstNode>(RuleNames.ARGUMENT_STATEMENT, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.StatementNumber));
    children.push(this.SUBRULE<IAstNode>(this.statement));
    return createRuleNode(RuleNames.ARGUMENT_STATEMENT, children);
  });
  private inference = this.RULE<IAstNode>(RuleNames.INFERENCE, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME1(lexer.InferenceStart));
    this.OPTION1(() => {
      children.push(this.SUBRULE1<IAstNode>(this.inferenceRules));
    });
    this.OPTION2(() => {
      children.push(this.CONSUME2(lexer.MetaData));
    });
    children.push(this.CONSUME3(lexer.InferenceEnd));
    this.OPTION3(() => {
      children.push(this.SUBRULE2<IAstNode>(this.inferenceRelations));
    });
    return createRuleNode(RuleNames.INFERENCE, children);
  });
  private inferenceRules = this.RULE<IAstNode>(RuleNames.INFERENCE_RULES, () => {
    let children: IAstNode[] = [];
    this.AT_LEAST_ONE_SEP1({
      SEP: lexer.ListDelimiter,
      DEF: () => children.push(this.SUBRULE(this.freestyleText))
    });
    return createRuleNode(RuleNames.INFERENCE_RULES, children);
  });

  private orderedList = this.RULE(RuleNames.ORDERED_LIST, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.Indent));
    this.AT_LEAST_ONE(() => children.push(this.SUBRULE(this.orderedListItem)));
    children.push(this.CONSUME(lexer.Dedent));
    return createRuleNode(RuleNames.ORDERED_LIST, children);
  });
  private unorderedList = this.RULE(RuleNames.UNORDERED_LIST, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.Indent));
    this.AT_LEAST_ONE(() => children.push(this.SUBRULE(this.unorderedListItem)));
    children.push(this.CONSUME(lexer.Dedent));
    return createRuleNode(RuleNames.ORDERED_LIST, children);
  });

  private unorderedListItem = this.RULE(RuleNames.UNORDERED_LIST_ITEM, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.UnorderedListItem));
    children.push(this.SUBRULE(this.statement));
    return createRuleNode(RuleNames.UNORDERED_LIST_ITEM, children);
  });
  private orderedListItem = this.RULE(RuleNames.ORDERED_LIST_ITEM, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.OrderedListItem));
    children.push(this.SUBRULE(this.statement));
    return createRuleNode(RuleNames.ORDERED_LIST_ITEM, children);
  });

  private argumentReference = this.RULE(RuleNames.ARGUMENT_REFERENCE, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.ArgumentReference));
    this.OPTION1(() => {
      children.push(this.CONSUME(lexer.MetaData));
    });
    this.OPTION2(() => {
      children.push(this.SUBRULE(this.relations));
    });
    return createRuleNode(RuleNames.ARGUMENT_REFERENCE, children);
  });

  private argumentDefinition = this.RULE(RuleNames.ARGUMENT_DEFINITION, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME1(lexer.ArgumentDefinition));
    children.push(this.SUBRULE2(this.statementContent));
    this.OPTION1(() => {
      children.push(this.CONSUME2(lexer.MetaData));
    });
    this.OPTION2(() => {
      children.push(this.SUBRULE(this.relations));
    });
    return createRuleNode(RuleNames.ARGUMENT_DEFINITION, children);
  });

  private statement = this.RULE(RuleNames.STATEMENT, () => {
    let children: IAstNode[] = [];
    children[0] = this.OR([
      {
        ALT: () => this.SUBRULE1(this.statementContent)
      },
      {
        ALT: () => this.CONSUME1(lexer.StatementReference)
      },
      {
        ALT: () => {
          let children = [];
          children.push(this.CONSUME2(lexer.StatementDefinition));
          children.push(this.SUBRULE3(this.statementContent));
          return createRuleNode(RuleNames.STATEMENT_DEFINITION, children);
        }
      }
    ]);
    this.OPTION1(() => {
      children.push(this.CONSUME3(lexer.MetaData));
    });
    this.OPTION2(() => {
      children.push(this.SUBRULE(this.relations));
    });
    return createRuleNode(RuleNames.STATEMENT, children);
  });

  private inferenceRelations = this.RULE("inferenceRelations", () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.Indent));
    // OR caching. see: http://sap.github.io/chevrotain/docs/FAQ.html#major-performance-benefits
    let atLeastOne = this.AT_LEAST_ONE<IAstNode>(() => this.SUBRULE(this.outgoingUndercut));
    children = children.concat(atLeastOne);
    children.push(this.CONSUME(lexer.Dedent));
    return createRuleNode(RuleNames.RELATIONS, children);
  });
  private relations = this.RULE(RuleNames.RELATIONS, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.Indent));
    // OR caching. see: http://sap.github.io/chevrotain/docs/FAQ.html#major-performance-benefits
    let atLeastOne = <IAstNode[]>this.AT_LEAST_ONE(() =>
      this.OR(
        this.c2 ||
          (this.c2 = [
            {
              ALT: () => this.SUBRULE(this.incomingSupport)
            },
            {
              ALT: () => this.SUBRULE(this.incomingAttack)
            },
            {
              ALT: () => this.SUBRULE(this.outgoingSupport)
            },
            {
              ALT: () => this.SUBRULE(this.outgoingAttack)
            },
            {
              ALT: () => this.SUBRULE(this.contradiction)
            },
            {
              ALT: () => this.SUBRULE(this.incomingUndercut)
            },
            {
              ALT: () => this.SUBRULE(this.outgoingUndercut)
            }
          ])
      )
    );
    children = children.concat(atLeastOne);
    children.push(this.CONSUME(lexer.Dedent));
    return createRuleNode(RuleNames.RELATIONS, children);
  });
  private incomingSupport = this.RULE(RuleNames.INCOMING_SUPPORT, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.IncomingSupport));
    this.OR({
      DEF: [
        { ALT: () => children.push(this.SUBRULE(this.statement)) },
        { ALT: () => children.push(this.SUBRULE(this.argumentDefinition)) },
        { ALT: () => children.push(this.SUBRULE(this.argumentReference)) }
      ]
    });

    return createRuleNode(RuleNames.INCOMING_SUPPORT, children);
  });
  private incomingAttack = this.RULE(RuleNames.INCOMING_ATTACK, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.IncomingAttack));
    this.OR({
      DEF: [
        { ALT: () => children.push(this.SUBRULE(this.statement)) },
        { ALT: () => children.push(this.SUBRULE(this.argumentDefinition)) },
        { ALT: () => children.push(this.SUBRULE(this.argumentReference)) }
      ]
    });
    return createRuleNode(RuleNames.INCOMING_ATTACK, children);
  });
  private incomingUndercut = this.RULE(RuleNames.INCOMING_UNDERCUT, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.IncomingUndercut));
    this.OR({
      DEF: [
        { ALT: () => children.push(this.SUBRULE(this.argumentDefinition)) },
        { ALT: () => children.push(this.SUBRULE(this.argumentReference)) }
      ]
    });
    return createRuleNode(RuleNames.INCOMING_UNDERCUT, children);
  });
  private outgoingUndercut = this.RULE(RuleNames.OUTGOING_UNDERCUT, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.OutgoingUndercut));
    this.OR({
      DEF: [
        { ALT: () => children.push(this.SUBRULE(this.statement)) },
        { ALT: () => children.push(this.SUBRULE(this.argumentDefinition)) },
        { ALT: () => children.push(this.SUBRULE(this.argumentReference)) }
      ]
    });
    return createRuleNode(RuleNames.OUTGOING_UNDERCUT, children);
  });

  private outgoingSupport = this.RULE(RuleNames.OUTGOING_SUPPORT, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.OutgoingSupport));
    this.OR({
      DEF: [
        { ALT: () => children.push(this.SUBRULE(this.statement)) },
        { ALT: () => children.push(this.SUBRULE(this.argumentDefinition)) },
        { ALT: () => children.push(this.SUBRULE(this.argumentReference)) }
      ]
    });
    return createRuleNode(RuleNames.OUTGOING_SUPPORT, children);
  });
  private outgoingAttack = this.RULE(RuleNames.OUTGOING_ATTACK, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.OutgoingAttack));
    this.OR({
      DEF: [
        { ALT: () => children.push(this.SUBRULE(this.statement)) },
        { ALT: () => children.push(this.SUBRULE(this.argumentDefinition)) },
        { ALT: () => children.push(this.SUBRULE(this.argumentReference)) }
      ]
    });
    return createRuleNode(RuleNames.OUTGOING_ATTACK, children);
  });
  private contradiction = this.RULE(RuleNames.CONTRADICTION, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.Contradiction));
    children.push(this.SUBRULE(this.statement));
    return createRuleNode(RuleNames.CONTRADICTION, children);
  });

  private bold = this.RULE(RuleNames.BOLD, () => {
    let children: IAstNode[] = [];
    this.OR([
      {
        ALT: () => {
          children.push(this.CONSUME(lexer.UnderscoreBoldStart));
          children.push(this.SUBRULE1(this.statementContent));
          children.push(this.CONSUME(lexer.UnderscoreBoldEnd));
        }
      },
      {
        ALT: () => {
          children.push(this.CONSUME(lexer.AsteriskBoldStart));
          children.push(this.SUBRULE2(this.statementContent));
          children.push(this.CONSUME(lexer.AsteriskBoldEnd));
        }
      }
    ]);
    return createRuleNode(RuleNames.BOLD, children);
  });
  private italic = this.RULE(RuleNames.ITALIC, () => {
    let children: IAstNode[] = [];
    this.OR([
      {
        ALT: () => {
          children.push(this.CONSUME(lexer.UnderscoreItalicStart));
          children.push(this.SUBRULE3(this.statementContent));
          children.push(this.CONSUME(lexer.UnderscoreItalicEnd));
        }
      },
      {
        ALT: () => {
          children.push(this.CONSUME(lexer.AsteriskItalicStart));
          children.push(this.SUBRULE4(this.statementContent));
          children.push(this.CONSUME(lexer.AsteriskItalicEnd));
        }
      }
    ]);
    return createRuleNode(RuleNames.ITALIC, children);
  });
  private statementContent = this.RULE(RuleNames.STATEMENT_CONTENT, () => {
    let children: IAstNode[] = [];
    // OR caching. see: http://sap.github.io/chevrotain/docs/FAQ.html#major-performance-benefits
    let atLeastOne = <IAstNode[]>this.AT_LEAST_ONE(() =>
      this.OR(
        this.c3 ||
          (this.c3 = [
            {
              ALT: () => this.SUBRULE(this.freestyleText)
            },
            {
              ALT: () => this.CONSUME(lexer.Link)
            },
            {
              ALT: () => this.SUBRULE(this.bold)
            },
            {
              ALT: () => this.SUBRULE(this.italic)
            },
            {
              ALT: () => this.CONSUME(lexer.Tag)
            },
            {
              ALT: () => this.CONSUME(lexer.ArgumentMention)
            },
            {
              ALT: () => this.CONSUME(lexer.StatementMention)
            }
            // , {
            //     ALT: () => children.push(this.CONSUME(lexer.StatementMentionByNumber))
            // }
          ])
      )
    );
    children = atLeastOne;
    return createRuleNode(RuleNames.STATEMENT_CONTENT, children);
  });

  private freestyleText = this.RULE(RuleNames.FREESTYLE_TEXT, () => {
    let children: IAstNode[] = [];
    this.AT_LEAST_ONE(() =>
      this.OR([
        {
          ALT: () => children.push(this.CONSUME(lexer.Freestyle))
        },
        {
          ALT: () => children.push(this.CONSUME(lexer.UnusedControlChar))
        },
        {
          ALT: () => children.push(this.CONSUME(lexer.EscapedChar))
        }
      ])
    );
    return createRuleNode(RuleNames.FREESTYLE_TEXT, children);
  });
}
export const parser = new ArgdownParser();
