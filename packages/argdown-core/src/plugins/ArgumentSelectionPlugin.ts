import * as _ from "lodash";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { ArgdownPluginError } from "../ArgdownPluginError";
import { reduceToMap } from "../utils";
import { IArgdownRequest, IArgdownResponse, ISelectionSettings } from "../index";
import { IEquivalenceClass, IArgument, StatementRole, IPCSStatement, IConclusion, isConclusion } from "../model/model";
import { otherRelationMemberIsInSelection } from "./utils";
declare module "../index" {
  interface ISelectionSettings {
    /**
     * Should statements and arguments be excluded from the map if they have
     * no relations to other selected arguments or statements?
     */
    excludeDisconnected?: boolean;
  }
}
const defaultSettings: ISelectionSettings = {
  excludeDisconnected: true
};
/**
 * Excludes all arguments from the selection that are not
 * connected by any relation to another element in the selection.
 *
 * This plugin should be run after the [[PreselectionPlugin]] and [[StatementSelectionPlugin]] and before the [[MapPlugin]].
 * The exclusion can be deactivated by using setting excludeDisconnected selection setting to false.
 *
 * An argument is considered to be connected if
 *    - argument.relations is not empty
 *    - a premise is supported/attacked by another argument or selected statement
 *    - the main conclusion is supporting/attacking another argument or selected statement
 *    - an inference is undercut by an argument or a selected statement
 *    - implicit support: a premise is equivalent with a main conclusion of another argument or a selected statement
 *    - implicit support: the main conclusion is equivalent with a premise of another argument or a selected statement
 */
export class ArgumentSelectionPlugin implements IArgdownPlugin {
  name = "ArgumentSelectionPlugin";
  defaults: ISelectionSettings;
  constructor(config?: ISelectionSettings) {
    this.defaults = _.defaultsDeep({}, config, defaultSettings);
  }
  getSettings = (request: IArgdownRequest): ISelectionSettings => {
    if (request.selection) {
      return request.selection;
    } else {
      request.selection = {};
      return request.selection;
    }
  };
  prepare: IRequestHandler = (request, response) => {
    if (!response.statements) {
      throw new ArgdownPluginError(this.name, "No statements field in response.");
    }
    if (!response.arguments) {
      throw new ArgdownPluginError(this.name, "No arguments field in response.");
    }
    if (!response.relations) {
      throw new ArgdownPluginError(this.name, "No relations field in response.");
    }
    _.defaultsDeep(this.getSettings(request), this.defaults);
  };
  run: IRequestHandler = (request, response) => {
    if (!response.selection) {
      throw new ArgdownPluginError(this.name, "No selection field in response.");
    }
    const settings = this.getSettings(request);
    const selectedArgumentsMap = reduceToMap(response.selection!.arguments, curr => curr.title!);
    const selectedStatementsMap = reduceToMap(response.selection!.statements, curr => curr.title!);

    response.selection!.arguments = response.selection!.arguments.filter(
      isArgumentSelected(settings, response, selectedStatementsMap, selectedArgumentsMap)
    );
  };
}
/**
 * Selects arguments if
 *  - either settings.excludeDisconnected is false
 *  - or one of the following conditions applies:
 *    - argument.relations is not empty
 *    - a premise is supported/attacked by another argument or selected statement
 *    - the main conclusion is supporting/attacking another argument or selected statement
 *    - an inference is undercut by an argument or a selected statement
 *    - implicit support: a premise is equivalent with a main conclusion of another argument or a selected statement
 *    - implicit support: the main conclusion is equivalent with a premise of another argument or a selected statement
 */
const isArgumentSelected = (
  settings: ISelectionSettings,
  response: IArgdownResponse,
  selectedStatements: Map<string, IEquivalenceClass>,
  selectedArguments: Map<string, IArgument>
) => (argument: IArgument) => {
  if (!settings.excludeDisconnected || (!settings.ignoreIsInMap && argument.data && argument.data.isInMap === true)) {
    return true;
  }
  let hasConnections = false;
  if (argument.relations && argument.relations.length > 0) {
    hasConnections =
      undefined !==
      argument.relations.find(r =>
        otherRelationMemberIsInSelection(r, argument, selectedStatements, selectedArguments)
      );
  }
  if (hasConnections) {
    return true;
  }
  if (argument.pcs && argument.pcs.length > 0) {
    hasConnections =
      undefined !==
      argument.pcs.find(s => {
        let hasConnections = false;
        // find incoming undercuts
        if (isConclusion(s) && (<IConclusion>s).inference!.relations!.length > 0) {
          const inference = (<IConclusion>s).inference!;
          hasConnections =
            undefined !==
            inference.relations!.find(r =>
              otherRelationMemberIsInSelection(r, inference, selectedStatements, selectedArguments)
            );
        }
        if (hasConnections) {
          return true;
        }
        const equivalenceClass = response.statements![s.title!];
        if (equivalenceClass.relations) {
          hasConnections =
            undefined !==
            equivalenceClass.relations.find(r => {
              if (s.role === StatementRole.PRELIMINARY_CONCLUSION) {
                return false;
              } else if (s.role === StatementRole.PREMISE && r.from! === equivalenceClass) {
                return false;
              } else if (s.role === StatementRole.MAIN_CONCLUSION && r.to === equivalenceClass) {
                return false;
              }
              return otherRelationMemberIsInSelection(r, equivalenceClass, selectedStatements, selectedArguments);
            });
          if (hasConnections) {
            return true;
          }
        }
        if (hasConnections) {
          return true;
        }
        return isPCSStatementConnectedByEquivalence(response, s, selectedStatements, selectedArguments);
      });
  }
  return hasConnections;
};
const isPCSStatementConnectedByEquivalence = (
  response: IArgdownResponse,
  s: IPCSStatement,
  selectedStatements: Map<string, IEquivalenceClass>,
  selectedArguments: Map<string, IArgument>
): boolean => {
  if (s.role === StatementRole.MAIN_CONCLUSION || s.role === StatementRole.PREMISE) {
    let requiredRole = StatementRole.MAIN_CONCLUSION;
    if (s.role === StatementRole.MAIN_CONCLUSION) {
      requiredRole = StatementRole.PREMISE;
    }
    if (selectedStatements.get(s.title!) !== undefined) {
      return true;
    }
    const ec = response.statements![s.title!];
    return (
      undefined !==
      ec.members.find(
        s => s.role === requiredRole && selectedArguments.get((<IPCSStatement>s).argumentTitle!) !== undefined
      )
    );
  }
  return false;
};
