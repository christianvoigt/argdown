import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { checkResponseFields } from "../ArgdownPluginError";
import { reduceToMap, mergeDefaults, isObject } from "../utils";
import { IArgdownRequest, ISelectionSettings } from "../index";
import {
  IEquivalenceClass,
  IArgument,
  StatementRole,
  RelationMember,
  ArgdownTypes,
  IRelation,
  IPCSStatement,
  IStatement,
  isPCSStatement
} from "../model/model";
import { otherRelationMemberIsInSelection } from "./selectionUtils";
import defaultsDeep from "lodash.defaultsdeep";
/**
 * The StatementSelectionMode in the [[ISelectionSettings]] determines which statements will be added as nodes to the argument map.
 */
export enum StatementSelectionMode {
  /**
   * Every statement will be added as node to the argument map.
   */
  ALL = "all",
  /**
   * Only statements with the StatementRole.TOP_LEVEL_STATEMENT or statements with otherwise not represented relations will be added to the argument map.
   */
  TOP_LEVEL = "top-level",
  /**
   * Only statements with with manually defined titles  or statements with otherwise not represented relations will be added to the argument map.
   */
  WITH_TITLE = "with-title",
  /**
   * Only statements with at least one relation to another node in the map will be added to the argument map.
   */
  WITH_RELATIONS = "with-relations",
  /**
   * Only statements not used in any argument's premise-conclusion-structure will be added to the argument map.
   */
  NOT_USED_IN_ARGUMENT = "not-used-in-argument",
  /**
   * Only statements that are in relations with more than one other node in the map or statements with otherwise not represented relations will be added to the argument map.
   */
  WITH_MORE_THAN_ONE_RELATION = "with-more-than-one-relation"
}
declare module "../index" {
  interface ISelectionSettings {
    /**
     * The StatementSelectionMode determines which statements are added as nodes to the argument map.
     */
    statementSelectionMode?: StatementSelectionMode;
    excludeDisconnected?: boolean;
  }
}
const defaultSettings: ISelectionSettings = {
  excludeDisconnected: true,
  statementSelectionMode: StatementSelectionMode.WITH_TITLE
};
/**
 * Excludes all statements from the selection that are
 *
 *  - not selected by
 *      - the includeStatements settings
 *      - an isInMap flag
 *      - the chosen [[StatementSelectionMode]],
 *  - or are not connected by any relation to another element in the selection (only if excludeDisconnected is true).
 *
 * This plugin should be run after the [[PreselectionPlugin]] and [[StatementSelectionPlugin]] and before the [[MapPlugin]].
 * The exclusion can be deactivated by using setting excludeDisconnected selection setting to false.
 *
 *  A statement is considered to be connected if
 *    - it has any relation to another element in the selection
 *    - it is used as a pcs statement (premise or conclusion).
 */
export class StatementSelectionPlugin implements IArgdownPlugin {
  name = "StatementSelectionPlugin";
  defaults: ISelectionSettings;
  constructor(config?: ISelectionSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
  }
  getSettings = (request: IArgdownRequest): ISelectionSettings => {
    if (isObject(request.selection)) {
      return request.selection;
    } else {
      request.selection = {};
      return request.selection;
    }
  };
  prepare: IRequestHandler = (request, response) => {
    checkResponseFields(this, response, [
      "statements",
      "arguments",
      "relations"
    ]);

    mergeDefaults(this.getSettings(request), this.defaults);
  };
  run: IRequestHandler = (request, response) => {
    checkResponseFields(this, response, ["selection"]);
    const settings = this.getSettings(request);
    const selectedStatementsMap = reduceToMap(
      response.selection!.statements,
      curr => curr.title!
    );
    const selectedArgumentsMap = reduceToMap(
      response.selection!.arguments,
      curr => curr.title!
    );
    response.selection!.statements = response.selection!.statements.filter(
      isStatementSelected(settings, selectedStatementsMap, selectedArgumentsMap)
    );
  };
}
const untitledPattern = /^Untitled/;
const isStatementSelected = (
  settings: ISelectionSettings,
  selectedStatements: Map<string, IEquivalenceClass>,
  selectedArguments: Map<string, IArgument>
) => (equivalenceClass: IEquivalenceClass) => {
  if (
    !settings.ignoreIsInMap &&
    equivalenceClass.data &&
    equivalenceClass.data.isInMap === true
  ) {
    return true;
  }
  if (
    settings.includeStatements &&
    settings.includeStatements.indexOf(equivalenceClass.title!) !== -1
  ) {
    return true;
  }
  const withRelations =
    equivalenceClass.relations!.length > 0 &&
    undefined !==
      equivalenceClass.relations!.find(r =>
        otherRelationMemberIsInSelection(
          r,
          equivalenceClass,
          selectedStatements,
          selectedArguments
        )
      );
  const usedInArgument = equivalenceClass.members.find(
    isUsedInSelectedArgument(selectedArguments)
  );
  let inSelection = false;
  switch (settings.statementSelectionMode) {
    case StatementSelectionMode.ALL:
      inSelection = true;
      break;
    case StatementSelectionMode.WITH_TITLE:
      inSelection =
        (!usedInArgument && withRelations) ||
        !untitledPattern.exec(equivalenceClass.title!);
      break;
    case StatementSelectionMode.TOP_LEVEL:
      inSelection =
        (!usedInArgument && withRelations) ||
        !!equivalenceClass.isUsedAsTopLevelStatement;
      break;
    case StatementSelectionMode.WITH_RELATIONS:
      inSelection = withRelations;
      break;
    case StatementSelectionMode.NOT_USED_IN_ARGUMENT:
      inSelection = !usedInArgument;
      break;
    case StatementSelectionMode.WITH_MORE_THAN_ONE_RELATION:
      const nrOfRelationPartners = equivalenceClass.relations!.reduce(
        (acc, r) => {
          return countOtherRelationMembersInSelection(
            acc,
            r,
            equivalenceClass,
            selectedStatements,
            selectedArguments
          );
        },
        0
      );
      inSelection =
        withRelations && (!usedInArgument || nrOfRelationPartners > 1);
      break;
  }
  return (
    (!settings.excludeDisconnected || (usedInArgument || withRelations)) &&
    inSelection
  );
};
const isUsedInSelectedArgument = (
  selectedArguments: Map<string, IArgument>
) => (statement: IStatement) => {
  if (
    isPCSStatement(statement) &&
    statement.role !== StatementRole.INTERMEDIARY_CONCLUSION
  ) {
    return selectedArguments.get(statement.argumentTitle!) !== undefined;
  }
  return false;
};
const countOtherRelationMembersInSelection = (
  currentCount: number,
  relation: IRelation,
  relationMember: RelationMember,
  selectedStatements: Map<string, IEquivalenceClass>,
  selectedArguments: Map<string, IArgument>
): number => {
  const other =
    relation.from === relationMember ? relation.to! : relation.from!;
  if (other.type === ArgdownTypes.EQUIVALENCE_CLASS) {
    if (selectedStatements.get(relationMember.title!) === undefined) {
      return currentCount;
    }
    let role = StatementRole.MAIN_CONCLUSION;
    if (relation.to === other) {
      role = StatementRole.PREMISE;
    }
    return other.members!.reduce(
      (acc, s) =>
        s.role === role &&
        selectedArguments.get((<IPCSStatement>s).argumentTitle!) !== undefined
          ? acc + 1
          : acc,
      currentCount
    );
  } else if (
    other.type === ArgdownTypes.ARGUMENT &&
    selectedArguments.get(other.title!) !== undefined
  ) {
    return currentCount + 1;
  } else if (
    other.type === ArgdownTypes.INFERENCE &&
    selectedArguments.get(other.argumentTitle!) !== undefined
  ) {
    return currentCount + 1;
  }
  return currentCount;
};
