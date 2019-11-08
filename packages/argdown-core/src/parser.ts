"use strict";

import { Parser } from "chevrotain";
import * as lexer from "./lexer";
import { errorMessageProvider } from "./ArgdownErrorMessageProvider";
import { IAstNode, IRuleNode } from "./model/model";
import { RuleNames } from "./RuleNames";

class ArgdownParser extends Parser {
  constructor() {
    super(lexer.tokenList, {
      errorMessageProvider: errorMessageProvider,
      recoveryEnabled: true,
      outputCst: false
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
    const children: IAstNode[] = [];
    this.OPTION1(() => {
      this.CONSUME1(lexer.Newline);
    });
    this.OPTION2(() => {
      this.CONSUME1(lexer.Emptyline);
    });
    this.OPTION3(() => {
      children.push(this.CONSUME2(lexer.FrontMatter));
      // If directly followed by comments we get NEWLINE, EMPTYLINE
      this.OPTION4(() => {
        this.CONSUME2(lexer.Newline);
      });
      children.push(this.CONSUME2(lexer.Emptyline));
    });
    // OR caching. see: http://sap.github.io/chevrotain/docs/FAQ.html#major-performance-benefits
    const atLeastOne: IAstNode[] = [];
    this.AT_LEAST_ONE_SEP({
      SEP: lexer.Emptyline,
      DEF: () => {
        atLeastOne.push(
          this.OR2(
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
                  ALT: () => this.SUBRULE(this.argument)
                },
                {
                  ALT: () => this.SUBRULE(this.orderedList)
                },
                {
                  ALT: () => this.SUBRULE(this.unorderedList)
                }
              ])
          )
        );
      }
    });
    children.push(...atLeastOne);

    return IRuleNode.create(RuleNames.ARGDOWN, children);
  });

  private heading = this.RULE(RuleNames.HEADING, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME1(lexer.HeadingStart));
    this.AT_LEAST_ONE({
      DEF: () => children.push(this.SUBRULE(this.statementContent))
    });
    this.OPTION1(() => {
      this.OPTION2(() => {
        children.push(this.CONSUME2(lexer.Newline));
      });
      children.push(this.CONSUME3(lexer.Data));
      this.OPTION3(() => {
        children.push(this.CONSUME4(lexer.Newline));
      });
    });
    return IRuleNode.create(RuleNames.HEADING, children);
  });
  private pcs = this.RULE<IAstNode>(RuleNames.PCS, () => {
    let children: IAstNode[] = [];
    children.push(this.SUBRULE1<IAstNode>(this.pcsStatement));
    this.AT_LEAST_ONE({
      DEF: () => {
        children.push(this.SUBRULE2<IAstNode>(this.pcsTail));
      }
    });
    return IRuleNode.create(RuleNames.PCS, children);
  });
  private pcsTail = this.RULE(RuleNames.PCS_TAIL, () => {
    let children: IAstNode[] = [];
    this.MANY({
      DEF: () => {
        children.push(this.SUBRULE1<IAstNode>(this.pcsStatement));
      }
    });
    children.push(this.SUBRULE2<IAstNode>(this.inference));
    children.push(this.SUBRULE3<IAstNode>(this.pcsStatement));
    return IRuleNode.create(RuleNames.PCS_TAIL, children);
  });
  private pcsStatement = this.RULE<IAstNode>(RuleNames.PCS_STATEMENT, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.StatementNumber));
    children.push(this.SUBRULE<IAstNode>(this.statement));
    return IRuleNode.create(RuleNames.PCS_STATEMENT, children);
  });
  private inference = this.RULE<IAstNode>(RuleNames.INFERENCE, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME1(lexer.InferenceStart));
    this.OPTION1(() => {
      this.OPTION2(() => {
        children.push(this.CONSUME1(lexer.Newline));
      });
      children.push(this.SUBRULE1<IAstNode>(this.inferenceRules));
    });
    this.OPTION3(() => {
      children.push(this.CONSUME2(lexer.Newline));
    });
    this.OPTION4(() => {
      children.push(this.CONSUME3(lexer.Data));
      this.OPTION5(() => {
        children.push(this.CONSUME3(lexer.Newline));
      });
    });
    children.push(this.CONSUME3(lexer.InferenceEnd));
    children.push(this.CONSUME4(lexer.Newline));
    this.OPTION6(() => {
      children.push(this.SUBRULE4<IAstNode>(this.inferenceRelations));
    });
    return IRuleNode.create(RuleNames.INFERENCE, children);
  });
  private inferenceRules = this.RULE<IAstNode>(
    RuleNames.INFERENCE_RULES,
    () => {
      let children: IAstNode[] = [];
      this.AT_LEAST_ONE_SEP1({
        SEP: lexer.ListDelimiter,
        DEF: () => children.push(this.SUBRULE(this.freestyleText))
      });
      return IRuleNode.create(RuleNames.INFERENCE_RULES, children);
    }
  );

  private orderedList = this.RULE(RuleNames.ORDERED_LIST, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.Indent));
    this.AT_LEAST_ONE(() => children.push(this.SUBRULE(this.orderedListItem)));
    this.CONSUME(lexer.Dedent); // Dedent is removed from AST
    //children.push(this.CONSUME(lexer.Dedent));
    return IRuleNode.create(RuleNames.ORDERED_LIST, children);
  });
  private unorderedList = this.RULE(RuleNames.UNORDERED_LIST, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.Indent));
    this.AT_LEAST_ONE(() =>
      children.push(this.SUBRULE(this.unorderedListItem))
    );
    this.CONSUME(lexer.Dedent); // Dedent is removed from AST
    // children.push(this.CONSUME(lexer.Dedent));
    return IRuleNode.create(RuleNames.UNORDERED_LIST, children);
  });

  private unorderedListItem = this.RULE(RuleNames.UNORDERED_LIST_ITEM, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.UnorderedListItem));
    this.OR({
      DEF: [
        { ALT: () => children.push(this.SUBRULE(this.statement)) },
        { ALT: () => children.push(this.SUBRULE(this.argument)) }
      ]
    });
    return IRuleNode.create(RuleNames.UNORDERED_LIST_ITEM, children);
  });
  private orderedListItem = this.RULE(RuleNames.ORDERED_LIST_ITEM, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.OrderedListItem));
    this.OR({
      DEF: [
        { ALT: () => children.push(this.SUBRULE(this.statement)) },
        { ALT: () => children.push(this.SUBRULE(this.argument)) }
      ]
    });
    return IRuleNode.create(RuleNames.ORDERED_LIST_ITEM, children);
  });
  private argument = this.RULE(RuleNames.ARGUMENT, () => {
    let children: IAstNode[] = [];
    this.OR([
      {
        ALT: () => {
          children.push(this.CONSUME1(lexer.ArgumentDefinition));
          children.push(this.SUBRULE2(this.statementContent));
        }
      },
      {
        ALT: () => {
          children.push(this.CONSUME1(lexer.ArgumentReference));
          this.MANY(() => {
            children.push(this.CONSUME2(lexer.Tag));
          });
          this.OPTION1(() => {
            children.push(this.CONSUME1(lexer.Newline));
          });
        }
      }
    ]);
    this.OPTION2(() => {
      children.push(this.CONSUME4(lexer.Data));
      this.OPTION3(() => {
        children.push(this.CONSUME2(lexer.Newline));
      });
    });
    this.OPTION4(() => {
      children.push(this.SUBRULE(this.relations));
    });
    return IRuleNode.create(RuleNames.ARGUMENT, children);
  });

  private statement = this.RULE(RuleNames.STATEMENT, () => {
    let children: IAstNode[] = [];
    this.OR([
      {
        ALT: () => {
          children.push(this.SUBRULE1(this.statementContent));
        }
      },
      {
        ALT: () => {
          children.push(this.CONSUME1(lexer.StatementReference));
          this.MANY(() => {
            children.push(this.CONSUME2(lexer.Tag));
          });
          this.OPTION1(() => {
            children.push(this.CONSUME1(lexer.Newline));
          });
        }
      },
      {
        ALT: () => {
          let defChildren = [];
          defChildren.push(this.CONSUME3(lexer.StatementDefinition));
          defChildren.push(this.SUBRULE4(this.statementContent));
          children.push(
            IRuleNode.create(RuleNames.STATEMENT_DEFINITION, defChildren)
          );
        }
      }
    ]);
    this.OPTION2(() => {
      children.push(this.CONSUME4(lexer.Data));
      this.OPTION3(() => {
        children.push(this.CONSUME2(lexer.Newline));
      });
    });
    this.OPTION4(() => {
      children.push(this.SUBRULE(this.relations));
    });
    return IRuleNode.create(RuleNames.STATEMENT, children);
  });

  private inferenceRelations = this.RULE("inferenceRelations", () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.Indent));
    // OR caching. see: http://sap.github.io/chevrotain/docs/FAQ.html#major-performance-benefits
    this.AT_LEAST_ONE(() => {
      children.push(this.SUBRULE(this.outgoingUndercut));
    });
    this.CONSUME(lexer.Dedent); // Dedent is removed from AST
    // children.push(this.CONSUME(lexer.Dedent));
    return IRuleNode.create(RuleNames.RELATIONS, children);
  });
  private relations = this.RULE(RuleNames.RELATIONS, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.Indent));
    // OR caching. see: http://sap.github.io/chevrotain/docs/FAQ.html#major-performance-benefits
    this.AT_LEAST_ONE(() => {
      children.push(
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
    });
    this.CONSUME(lexer.Dedent); // Dedent is removed from AST
    // children.push(this.CONSUME(lexer.Dedent));
    return IRuleNode.create(RuleNames.RELATIONS, children);
  });
  private incomingSupport = this.RULE(RuleNames.INCOMING_SUPPORT, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.IncomingSupport));
    this.OR({
      DEF: [
        { ALT: () => children.push(this.SUBRULE(this.statement)) },
        { ALT: () => children.push(this.SUBRULE(this.argument)) }
      ]
    });

    return IRuleNode.create(RuleNames.INCOMING_SUPPORT, children);
  });
  private incomingAttack = this.RULE(RuleNames.INCOMING_ATTACK, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.IncomingAttack));
    this.OR({
      DEF: [
        { ALT: () => children.push(this.SUBRULE(this.statement)) },
        { ALT: () => children.push(this.SUBRULE(this.argument)) }
      ]
    });
    return IRuleNode.create(RuleNames.INCOMING_ATTACK, children);
  });
  private incomingUndercut = this.RULE(RuleNames.INCOMING_UNDERCUT, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.IncomingUndercut));
    this.OR({
      DEF: [
        { ALT: () => children.push(this.SUBRULE(this.statement)) },
        { ALT: () => children.push(this.SUBRULE(this.argument)) }
      ]
    });
    return IRuleNode.create(RuleNames.INCOMING_UNDERCUT, children);
  });
  private outgoingUndercut = this.RULE(RuleNames.OUTGOING_UNDERCUT, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.OutgoingUndercut));
    this.OR({
      DEF: [
        { ALT: () => children.push(this.SUBRULE(this.statement)) },
        { ALT: () => children.push(this.SUBRULE(this.argument)) }
      ]
    });
    return IRuleNode.create(RuleNames.OUTGOING_UNDERCUT, children);
  });

  private outgoingSupport = this.RULE(RuleNames.OUTGOING_SUPPORT, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.OutgoingSupport));
    this.OR({
      DEF: [
        { ALT: () => children.push(this.SUBRULE(this.statement)) },
        { ALT: () => children.push(this.SUBRULE(this.argument)) }
      ]
    });
    return IRuleNode.create(RuleNames.OUTGOING_SUPPORT, children);
  });
  private outgoingAttack = this.RULE(RuleNames.OUTGOING_ATTACK, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.OutgoingAttack));
    this.OR({
      DEF: [
        { ALT: () => children.push(this.SUBRULE(this.statement)) },
        { ALT: () => children.push(this.SUBRULE(this.argument)) }
      ]
    });
    return IRuleNode.create(RuleNames.OUTGOING_ATTACK, children);
  });
  private contradiction = this.RULE(RuleNames.CONTRADICTION, () => {
    let children: IAstNode[] = [];
    children.push(this.CONSUME(lexer.Contradiction));
    children.push(this.SUBRULE(this.statement));
    return IRuleNode.create(RuleNames.CONTRADICTION, children);
  });

  private bold = this.RULE(RuleNames.BOLD, () => {
    let children: IAstNode[] = [];
    this.OR([
      {
        ALT: () => {
          children.push(this.CONSUME(lexer.UnderscoreBoldStart));
          this.OPTION1(() => {
            children.push(this.SUBRULE1(this.statementContent));
          });
          children.push(this.CONSUME(lexer.UnderscoreBoldEnd));
        }
      },
      {
        ALT: () => {
          children.push(this.CONSUME(lexer.AsteriskBoldStart));
          this.OPTION2(() => {
            children.push(this.SUBRULE2(this.statementContent));
          });
          children.push(this.CONSUME(lexer.AsteriskBoldEnd));
        }
      }
    ]);
    return IRuleNode.create(RuleNames.BOLD, children);
  });
  private italic = this.RULE(RuleNames.ITALIC, () => {
    let children: IAstNode[] = [];
    this.OR([
      {
        ALT: () => {
          children.push(this.CONSUME(lexer.UnderscoreItalicStart));
          this.OPTION1(() => {
            children.push(this.SUBRULE3(this.statementContent));
          });
          children.push(this.CONSUME(lexer.UnderscoreItalicEnd));
        }
      },
      {
        ALT: () => {
          children.push(this.CONSUME(lexer.AsteriskItalicStart));
          this.OPTION2(() => {
            children.push(this.SUBRULE4(this.statementContent));
          });
          children.push(this.CONSUME(lexer.AsteriskItalicEnd));
        }
      }
    ]);
    return IRuleNode.create(RuleNames.ITALIC, children);
  });
  private statementContent = this.RULE(RuleNames.STATEMENT_CONTENT, () => {
    let children: IAstNode[] = [];
    // OR caching. see: http://sap.github.io/chevrotain/docs/FAQ.html#major-performance-benefits
    this.AT_LEAST_ONE(() => {
      children.push(
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
              },
              {
                ALT: () => this.CONSUME(lexer.Newline)
              }

              // , {
              //     ALT: () => children.push(this.CONSUME(lexer.StatementMentionByNumber))
              // }
            ])
        )
      );
      // this.OPTION1(() => {
      //   children.push(this.CONSUME1(lexer.Newline));
      // });
    });
    return IRuleNode.create(RuleNames.STATEMENT_CONTENT, children);
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
    return IRuleNode.create(RuleNames.FREESTYLE_TEXT, children);
  });
}
export const parser = new ArgdownParser();
