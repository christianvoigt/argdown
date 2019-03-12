import {
  CompletionItem,
  CompletionItemKind,
  Position,
  Range,
  TextEdit
} from "vscode-languageserver";
import { IArgument, IEquivalenceClass, IArgdownResponse } from "@argdown/core";
const statementPattern = /\[([^\[]+?)\]$/;
const argumentPattern = /<([^<]+?)>$/;
export const provideCompletion = (
  response: IArgdownResponse,
  char: string,
  position: Position,
  text: string,
  offset: number
) => {
  const range = Range.create(
    position.line,
    position.character - 1,
    position.line,
    position.character + 1
  );
  if (!response.statements || !response.arguments) {
    return [];
  }
  if (char === "[") {
    return Object.keys(response.statements!).map((k: any) => {
      const eqClass = response.statements![k];
      const title = eqClass.title;
      const item = CompletionItem.create(`[${title}]`);
      item.textEdit = TextEdit.replace(range, `[${title}]`);
      item.kind = CompletionItemKind.Variable;
      item.detail = IEquivalenceClass.getCanonicalMemberText(eqClass);
      return item;
    });
  } else if (char === "<") {
    return Object.keys(response.arguments!).map((k: any) => {
      const argument = response.arguments![k];
      const title = argument.title;
      const item = CompletionItem.create(`<${title}>`);
      item.textEdit = TextEdit.replace(range, `<${title}>`);
      item.kind = CompletionItemKind.Variable;
      const desc = IArgument.getCanonicalMemberText(argument);
      if (desc) {
        item.detail = desc;
      }
      return item;
    });
  } else if (char === ":") {
    const textBefore = text.slice(0, offset - 1);
    const statementMatch = textBefore.match(statementPattern);
    if (statementMatch && statementMatch.length > 1) {
      const title = statementMatch[1];
      const eqClass = response.statements![title];
      if (!eqClass.members) {
        return [];
      }
      return eqClass.members
        .filter(member => !member.isReference)
        .map(member => {
          const item = CompletionItem.create(member.text!);
          item.kind = CompletionItemKind.Value;
          item.detail = `[${title}]: ${member.text}`;
          item.insertText = ` ${member.text}
`;
          return item;
        });
    } else {
      const argumentMatch = textBefore.match(argumentPattern);
      if (argumentMatch && argumentMatch.length > 1) {
        const title = argumentMatch[1];
        const argument = response.arguments![title];
        if (argument.members) {
          return argument.members
            .filter(member => !member.isReference)
            .map(member => {
              const item = CompletionItem.create(member.text!);
              item.kind = CompletionItemKind.Value;
              item.detail = `<${title}>: ${member.text}`;
              item.insertText = ` ${member.text}
`;
              item.kind = CompletionItemKind.Value;
              return item;
            });
        }
      }
    }
  } else if (char === "#" && response.tags) {
    return Object.keys(response.tags).map((t: any) => {
      const item = CompletionItem.create(`#(${t})`);
      item.insertText = `(${t})`;
      item.kind = CompletionItemKind.Keyword;
      return item;
    });
  }
  return [];
};
