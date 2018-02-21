'use strict';

import chevrotain, {
    Parser,
    getTokenConstructor
} from 'chevrotain';
import {ArgdownLexer} from './ArgdownLexer.js';
import {ArgdownErrorMessageProvider} from './ArgdownErrorMessageProvider.js';

class ArgdownParser extends chevrotain.Parser {

    constructor(input, lexer) {
        super(input, lexer.tokens, {
            errorMessageProvider: ArgdownErrorMessageProvider,
            recoveryEnabled: true            
        });
        let $ = this;
        $.lexer = lexer;        

        $.argdown = $.RULE("argdown", () => {
            $.OPTION1(() => {
                $.CONSUME1(lexer.Emptyline);
            });        
            let atLeastOne = $.AT_LEAST_ONE_SEP({
                SEP: lexer.Emptyline,
                DEF: () => $.OR([{
                    ALT: () => $.SUBRULE($.heading)
                }, {
                    ALT: () => $.SUBRULE($.statement)
                },  {
                    ALT: () => $.SUBRULE($.argument)
                },  {
                    ALT: () => $.SUBRULE($.argumentDefinition)
                },  {
                    ALT: () => $.SUBRULE($.argumentReference)
                }, {
                    ALT: () => $.SUBRULE($.orderedList)
                }, {
                    ALT: () => $.SUBRULE($.unorderedList)
                }])
            });            
                   
            return {
                name: 'argdown',
                children: atLeastOne.values
            };
        });

        $.heading = $.RULE("heading", () => {
            let children = [];
            children.push($.CONSUME(lexer.HeadingStart));
            $.AT_LEAST_ONE({
              DEF:()=>children.push($.SUBRULE($.statementContent))
            });

            return {
                name: "heading",
                children: children
            };
        });
        $.argument = $.RULE("argument", () => {
            let children = [];
            children.push($.SUBRULE($.argumentStatement));                        
            $.AT_LEAST_ONE({
              DEF:()=>{
                children.push($.SUBRULE($.argumentBody));
              }
            });
            return {
                name: "argument",
                children: children
            };
        });
        $.argumentBody = $.RULE("argumentBody",() =>{
          let children = [];
          $.MANY({
            DEF:()=>{
              children.push($.SUBRULE2($.argumentStatement));
            }
          });
          children.push($.SUBRULE($.inference));          
          children.push($.SUBRULE1($.argumentStatement));
          return {
              name: "argumentBody",
              children: children
          };        
        });
        $.argumentStatement = $.RULE("argumentStatement", () => {
            let children = [];
            children.push($.CONSUME(lexer.StatementNumber));
            children.push($.SUBRULE($.statement));
            return {
                name: "argumentStatement",
                children: children
            };
        });
        $.inference = $.RULE("inference", () => {
            let children = [];
            children.push($.CONSUME(lexer.InferenceStart));
            $.OPTION1(() => {
                children.push($.SUBRULE($.inferenceRules));
            });
            $.OPTION2(() => {
                children.push($.SUBRULE($.metadata));
            });
            children.push($.CONSUME(lexer.InferenceEnd));
            return {
                name: "inference",
                children: children
            };
        });
        $.inferenceRules = $.RULE("inferenceRules", () => {
            let children = [];
            $.AT_LEAST_ONE_SEP1({
                SEP: lexer.ListDelimiter,
                DEF: () => children.push($.SUBRULE($.freestyleText))
            });
            return {
                name: "inferenceRules",
                children: children
            };
        });
        $.metadata = $.RULE("metadata", () => {
            let children = [];
            children.push($.CONSUME(lexer.MetadataStart));
            $.AT_LEAST_ONE_SEP({
                SEP: lexer.MetadataStatementEnd,
                DEF: () => children.push($.SUBRULE($.metadataStatement))
            });
            children.push($.CONSUME(lexer.MetadataEnd));
            return {
                name: "metadata",
                children: children
            };
        });
        $.metadataStatement = $.RULE("metadataStatement", () => {
            let children = [];
            children.push($.SUBRULE1($.freestyleText));
            $.CONSUME(lexer.Colon);
            $.AT_LEAST_ONE_SEP({
                SEP: lexer.ListDelimiter,
                DEF: () => children.push($.SUBRULE2($.freestyleText))
            });
            return {
                name: "metadataStatement",
                children: children
            };
        });

        $.list = $.RULE("orderedList", () => {
            let children = [];
            children.push($.CONSUME(lexer.Indent));
            $.AT_LEAST_ONE(() => children.push($.SUBRULE($.orderedListItem)));
            children.push($.CONSUME(lexer.Dedent));
            return {
                name: 'orderedList',
                children: children
            };
        });
        $.list = $.RULE("unorderedList", () => {
            let children = [];
            children.push($.CONSUME(lexer.Indent));
            $.AT_LEAST_ONE(() => children.push($.SUBRULE($.unorderedListItem)));
            children.push($.CONSUME(lexer.Dedent));
            return {
                name: 'unorderedList',
                children: children
            };
        });

        $.unorderedListItem = $.RULE("unorderedListItem", () => {
            let children = [];
            children.push($.CONSUME(lexer.UnorderedListItem));
            children.push($.SUBRULE($.statement));
            return {
                name: "unorderedListItem",
                children: children
            };
        });
        $.orderedListItem = $.RULE("orderedListItem", () => {
            let children = [];
            children.push($.CONSUME(lexer.OrderedListItem));
            children.push($.SUBRULE($.statement));
            return {
                name: "orderedListItem",
                children: children
            };
        });

        $.argumentReference = $.RULE("argumentReference", ()=>{
          let children = [];
          children.push($.CONSUME(lexer.ArgumentReference));
          $.OPTION(() => {
              children.push($.SUBRULE($.argumentRelations))
          });
          return {
              name: 'argumentReference',
              children: children
          };
        });

        $.argumentDescription = $.RULE("argumentDefinition", () =>{
          let children = [];
          children.push($.CONSUME(lexer.ArgumentDefinition));
          children.push($.SUBRULE2($.statementContent));
          $.OPTION1(() => {
              children.push($.SUBRULE($.argumentRelations))
          });
          return {
              name: 'argumentDefinition',
              children: children
          };
        });

        $.statement = $.RULE("statement", () => {
            let children = [];
            children[0] = $.OR([{
                ALT: () => $.SUBRULE1($.statementContent)
            }, {
                ALT: () => $.CONSUME(lexer.StatementReference)
            }, {
                ALT: () => {
                    let children = [];
                    children.push($.CONSUME(lexer.StatementDefinition));
                    children.push($.SUBRULE3($.statementContent));
                    return {
                        name: "statementDefinition",
                        children: children
                    };
                }}
                // , {
                // ALT: () => {
                //     let children = [];
                //     children.push($.CONSUME(lexer.StatementReferenceByNumber));
                //     return {
                //         name: "statementReferenceByNumber",
                //         children: children
                //     };
                // }},{
                // ALT: () => {
                //     let children = [];
                //     children.push($.CONSUME(lexer.StatementDefinitionByNumber));
                //     children.push($.SUBRULE2($.statementContent));
                //     return {
                //         name: "statementDefinitionByNumber",
                //         children: children
                //     };
                // }
              //}
            ]);
            $.OPTION(() => {
                children.push($.SUBRULE($.statementRelations))
            });
            return {
                name: 'statement',
                children: children
            };
        });

        $.statementRelations = $.RULE("statementRelations", () => {
            let children = [];
            children.push($.CONSUME(lexer.Indent));
            let atLeastOne = $.AT_LEAST_ONE(() => $.OR([{
                ALT: () => $.SUBRULE($.incomingSupport)
            }, {
                ALT: () => $.SUBRULE($.incomingAttack)
            }, {
                ALT: () => $.SUBRULE($.outgoingSupport)
            }, {
                ALT: () => $.SUBRULE($.outgoingAttack)
            },{
                ALT: () => $.SUBRULE($.contradiction)
            },{
                ALT: () => $.SUBRULE($.incomingUndercut)
            }]));
            children = children.concat(atLeastOne);
            children.push($.CONSUME(lexer.Dedent));
            return {
                name: 'relations',
                children: children
            };
        });
        $.argumentRelations = $.RULE("argumentRelations", () => {
            let children = [];
            children.push($.CONSUME(lexer.Indent));
            let atLeastOne = $.AT_LEAST_ONE(() => $.OR([{
                ALT: () => $.SUBRULE($.incomingSupport)
            }, {
                ALT: () => $.SUBRULE($.incomingAttack)
            }, {
                ALT: () => $.SUBRULE($.outgoingSupport)
            }, {
                ALT: () => $.SUBRULE($.outgoingAttack)
            }, {
                ALT: () => $.SUBRULE($.incomingUndercut)
            }, {
                ALT: () => $.SUBRULE($.outgoingUndercut)
            }]));
            children = children.concat(atLeastOne);
            children.push($.CONSUME(lexer.Dedent));
            return {
                name: 'relations',
                children: children
            };
        });
        $.incomingSupport = $.RULE("incomingSupport", () => {
            let children = [];
            children.push($.CONSUME(lexer.IncomingSupport));
            $.OR({
              DEF : [
                {ALT: ()=> children.push($.SUBRULE($.statement))},
                {ALT: ()=> children.push($.SUBRULE($.argumentDefinition))},
                {ALT: ()=> children.push($.SUBRULE($.argumentReference))}
              ]
            });

            return {
                name: 'incomingSupport',
                children: children
            };
        });
        $.incomingAttack = $.RULE("incomingAttack", () => {
            let children = [];
            children.push($.CONSUME(lexer.IncomingAttack));
            $.OR({
              DEF : [
                {ALT: ()=> children.push($.SUBRULE($.statement))},
                {ALT: ()=> children.push($.SUBRULE($.argumentDefinition))},
                {ALT: ()=> children.push($.SUBRULE($.argumentReference))}
              ]
            });
            return {
                name: 'incomingAttack',
                children: children
            };
        });
        $.incomingUndercut = $.RULE("incomingUndercut", () => {
            let children = [];
            children.push($.CONSUME(lexer.IncomingUndercut));
            $.OR({
                DEF: [
                    { ALT: () => children.push($.SUBRULE($.argumentDefinition)) },
                    { ALT: () => children.push($.SUBRULE($.argumentReference)) }
                ]
            });
            return {
                name: 'incomingUndercut',
                children: children
            };
        });
        $.outgoingUndercut = $.RULE("outgoingUndercut", () => {
            let children = [];
            children.push($.CONSUME(lexer.OutgoingUndercut));
            $.OR({
                DEF: [
                    { ALT: () => children.push($.SUBRULE($.statement)) },
                    { ALT: () => children.push($.SUBRULE($.argumentDefinition)) },
                    { ALT: () => children.push($.SUBRULE($.argumentReference)) }
                ]
            });
            return {
                name: 'outgoingUndercut',
                children: children
            };
        });

        $.outgoingSupport = $.RULE("outgoingSupport", () => {
            let children = [];
            children.push($.CONSUME(lexer.OutgoingSupport));
            $.OR({
              DEF : [
                {ALT: ()=> children.push($.SUBRULE($.statement))},
                {ALT: ()=> children.push($.SUBRULE($.argumentDefinition))},
                {ALT: ()=> children.push($.SUBRULE($.argumentReference))}
              ]
            });
            return {
                name: 'outgoingSupport',
                children: children
            };
        });
        $.outgoingAttack = $.RULE("outgoingAttack", () => {
            let children = [];
            children.push($.CONSUME(lexer.OutgoingAttack));
            $.OR({
              DEF : [
                {ALT: ()=> children.push($.SUBRULE($.statement))},
                {ALT: ()=> children.push($.SUBRULE($.argumentDefinition))},
                {ALT: ()=> children.push($.SUBRULE($.argumentReference))}
              ]
            });
            return {
                name: 'outgoingAttack',
                children: children
            };
        });
        $.contradiction = $.RULE("contradiction", () => {
            let children = [];
            children.push($.CONSUME(lexer.Contradiction));
            children.push($.SUBRULE($.statement));
            return {
                name: 'contradiction',
                children: children
            };
        });

        $.bold = $.RULE("bold",()=>{
          let children = [];
          $.OR([{
              ALT: () => {
                  children.push($.CONSUME(lexer.UnderscoreBoldStart));
                  children.push($.SUBRULE1($.statementContent));
                  children.push($.CONSUME(lexer.UnderscoreBoldEnd));
              }
          }, {
              ALT: () => {
                  children.push($.CONSUME(lexer.AsteriskBoldStart));
                  children.push($.SUBRULE2($.statementContent));
                  children.push($.CONSUME(lexer.AsteriskBoldEnd));
              }
          }]);
          return {name:'bold', children:children};
        });
        $.italic = $.RULE("italic",()=>{
          let children = [];
          $.OR([{
              ALT: () => {
                  children.push($.CONSUME(lexer.UnderscoreItalicStart));
                  children.push($.SUBRULE3($.statementContent));
                  children.push($.CONSUME(lexer.UnderscoreItalicEnd));
              }
          }, {
              ALT: () => {
                  children.push($.CONSUME(lexer.AsteriskItalicStart));
                  children.push($.SUBRULE4($.statementContent));
                  children.push($.CONSUME(lexer.AsteriskItalicEnd));
              }
          }]);
          return {name:'italic', children:children};
        });
        $.statementContent = $.RULE("statementContent", () => {
            let children = [];
            $.AT_LEAST_ONE(() => $.OR([{
                ALT: () => children.push($.SUBRULE($.freestyleText))
            }, {
                ALT: () => children.push($.CONSUME(lexer.Link))
            }, {
                ALT: () => children.push($.SUBRULE($.bold))
            }, {
                ALT: () => children.push($.SUBRULE($.italic))
            }, {
                ALT: () => children.push($.CONSUME(lexer.Tag))
            }, {
                ALT: () => children.push($.CONSUME(lexer.ArgumentMention))
            }, {
                ALT: () => children.push($.CONSUME(lexer.StatementMention))
            }

            // , {
            //     ALT: () => children.push($.CONSUME(lexer.StatementMentionByNumber))
            // }
        ]));
            return {
                name: 'statementContent',
                children: children
            };
        });

        $.freestyleText = $.RULE("freestyleText", () => {
            let children = [];
            $.AT_LEAST_ONE(() => $.OR([{
                ALT: () => children.push($.CONSUME(lexer.Freestyle))
            }, {
                ALT: () => children.push($.CONSUME(lexer.UnusedControlChar))
            },{
                ALT: () => children.push($.CONSUME(lexer.EscapedChar))
            }]));
            return {
                name: "freestyleText",
                children: children
            };
        });
        // very important to call this after all the rules have been defined.
        // otherwise the parser may not work correctly as it will lack information
        // derived during the self analysis phase.
        Parser.performSelfAnalysis(this);
    }

    astToString(value) {
        return this.logAstRecursively(value, "", "");
    }
    astToJsonString(value) {
        return JSON.stringify(value, null, 2);
    }
    logAstRecursively(value, pre, str) {
        if (value === undefined) {
            str += "undefined";
            return str;
        } else if (value.tokenType) {
            str += getTokenConstructor(value).tokenName;
            return str;
        }
        str += value.name;
        if (value.children && value.children.length > 0) {
            let nextPre = pre + " |";
            for (let child of value.children) {
                str += "\n" + nextPre + "__";
                str = this.logAstRecursively(child, nextPre, str);
            }
            str += "\n" + pre;
        }
        return str;
    }

}

module.exports = {
    ArgdownParser: new ArgdownParser("", ArgdownLexer)
}
