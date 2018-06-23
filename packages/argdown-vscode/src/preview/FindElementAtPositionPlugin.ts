import {
  IAstNode,
  IRequestHandler,
  ITokenNodeHandler,
  IEquivalenceClass,
  IArgument,
  IArgdownPlugin,
  TokenNames
} from "@argdown/core";

const positionIsInRange = (
  node: IAstNode,
  settings: IFindElementAtPositionSettings
) => {
  if (
    (node.startLine || 1) > (settings.line || 1) ||
    (node.endLine || 1) < (settings.line || 1)
  ) {
    return false;
  }
  return (
    (node.startLine !== settings.line ||
      (node.startColumn || 1) <= (settings.character || 1)) &&
    (node.endLine !== settings.line ||
      (node.endColumn || 1) >= (settings.character || 1))
  );
};
export interface IFindElementAtPositionSettings {
  line?: number;
  character?: number;
}
declare module "@argdown/core" {
  interface IArgdownRequest {
    findElementAtPosition?: IFindElementAtPositionSettings;
  }
  interface IArgdownResponse {
    elementAtPosition?: IArgument | IEquivalenceClass;
  }
}

export const findElementAtPositionPlugin: IArgdownPlugin = {
  name: "FindElementAtPositionPlugin",
  prepare: <IRequestHandler>(request => {
    request.findElementAtPosition = request.findElementAtPosition || {};
  }),
  tokenListeners: {
    [TokenNames.ARGUMENT_REFERENCE]: <ITokenNodeHandler>((
      request,
      response,
      token
    ) => {
      if (positionIsInRange(token, request.findElementAtPosition!)) {
        const argument = response.arguments![token.title!];
        response.elementAtPosition = argument;
      }
    }),
    [TokenNames.ARGUMENT_MENTION]: <ITokenNodeHandler>((
      request,
      response,
      node
    ) => {
      if (positionIsInRange(node, request.findElementAtPosition!)) {
        const argument = response.arguments![node.title!];
        response.elementAtPosition = argument;
      }
    }),
    [TokenNames.ARGUMENT_DEFINITION]: <ITokenNodeHandler>((
      request,
      response,
      node
    ) => {
      if (positionIsInRange(node, request.findElementAtPosition!)) {
        const statement = response.arguments![node.title!];
        response.elementAtPosition = statement;
      }
    }),
    [TokenNames.STATEMENT_REFERENCE]: <ITokenNodeHandler>((
      request,
      response,
      node
    ) => {
      if (positionIsInRange(node, request.findElementAtPosition!)) {
        const statement = response.statements![node.title!];
        response.elementAtPosition = statement;
      }
    }),
    [TokenNames.STATEMENT_MENTION]: <ITokenNodeHandler>((
      request,
      response,
      node
    ) => {
      if (positionIsInRange(node, request.findElementAtPosition!)) {
        const statement = response.statements![node.title!];
        response.elementAtPosition = statement;
      }
    }),
    [TokenNames.STATEMENT_DEFINITION]: <ITokenNodeHandler>((
      request,
      response,
      node
    ) => {
      if (positionIsInRange(node, request.findElementAtPosition!)) {
        const statement = response.statements![node.title!];
        response.elementAtPosition = statement;
      }
    })
  }
};
