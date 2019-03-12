import {
  IRelation,
  RelationMember,
  ArgdownTypes,
  isPCSStatement,
  StatementRole,
  RelationType,
  IArgument,
  IEquivalenceClass,
  isConclusion
} from "./model/model";
import { other } from "./utils";
export const transformToArgumentRelationType = (relationType: RelationType) => {
  switch (relationType) {
    case RelationType.ENTAILS:
      return RelationType.SUPPORT;
    case RelationType.CONTRADICTORY:
    case RelationType.CONTRARY:
      return RelationType.ATTACK;
    default:
      return relationType;
  }
};
/**
 * Derives implicit relations from defined equivalence classes and argument premise-conclusion-structures.
 * This will not derive all logically derivable relations, but only those that directly result
 * from equivalence classes being used as premises or main conclusions in arguments:
 *
 * Examples:
 * if ec is used as premise in a: derives support of ec for a
 * if ec is used as main conclusion in a: derives support of a for ec
 * if ec attacks/supports a1 and is used as main conclusion in a2: derives attack/support of a2 for a1
 * if ec1 is contrary/contradictory to ec2, ec1 is used as premise in a1 and ec2 is used as main conclusion in a2: derives attacks of a2 against ec1 and a1.
 *
 * @param member the relation member (argument, equivalence class, inference) for which the implicit relations should be derived
 * @param statementsMap the statements field of the ArgdownResponse
 * @param argumentsMap the arguments field of the ArgdownResponse
 * @returns an array of derived implicit relations
 */
export const deriveImplicitRelations = (
  member: RelationMember,
  statementsMap: { [key: string]: IEquivalenceClass },
  argumentsMap: { [key: string]: IArgument }
) => {
  const implicitRelations: IRelation[] = [];
  if (member.relations) {
    member.relations.reduce((acc, explicitRelation) => {
      const otherMember = other(explicitRelation, member);
      if (otherMember.type === ArgdownTypes.ARGUMENT) {
        return acc;
      } else if (otherMember.type === ArgdownTypes.INFERENCE) {
        acc.push({
          ...explicitRelation,
          to: argumentsMap[otherMember.argumentTitle!]
        });
        return acc;
      }
      const isOutgoing = explicitRelation.from === member;
      const isSymmetric = IRelation.isSymmetric(explicitRelation);
      otherMember.members.reduce((acc, statement) => {
        if (!isPCSStatement(statement)) {
          return acc;
        }
        const argument = argumentsMap[statement.argumentTitle!];
        if (
          (isSymmetric || isOutgoing) &&
          statement.role === StatementRole.PREMISE
        ) {
          acc.push({
            relationType: transformToArgumentRelationType(
              explicitRelation.relationType
            ),
            from: member,
            to: argument,
            type: ArgdownTypes.RELATION,
            occurrences: []
          });
        } else if (
          (isSymmetric || !isOutgoing) &&
          statement.role === StatementRole.MAIN_CONCLUSION
        ) {
          acc.push({
            relationType: transformToArgumentRelationType(
              explicitRelation.relationType
            ),
            from: argument,
            to: member,
            type: ArgdownTypes.RELATION,
            occurrences: []
          });
        }
        return acc;
      }, acc);
      return acc;
    }, implicitRelations);
  }
  if (member.type === ArgdownTypes.EQUIVALENCE_CLASS) {
    member.members.reduce((acc, statement) => {
      if (!isPCSStatement(statement)) {
        return acc;
      }
      const argument = argumentsMap[statement.argumentTitle!];
      if (statement.role === StatementRole.PREMISE) {
        acc.push({
          relationType: RelationType.SUPPORT,
          from: member,
          to: argument,
          type: ArgdownTypes.RELATION,
          occurrences: []
        });
      } else if (statement.role === StatementRole.MAIN_CONCLUSION) {
        acc.push({
          relationType: RelationType.SUPPORT,
          from: argument,
          to: member,
          type: ArgdownTypes.RELATION,
          occurrences: []
        });
      }
      return acc;
    }, implicitRelations);
  } else if (member.type === ArgdownTypes.ARGUMENT && member.pcs) {
    member.pcs.reduce((acc, pcsStatement) => {
      const ec = statementsMap[pcsStatement.title!];
      const ecRelations = [
        ...(ec.relations || []),
        ...deriveImplicitRelations(ec, statementsMap, argumentsMap)
      ];
      ecRelations.reduce((acc, ecRelation) => {
        if (other(ecRelation, ec) === member) {
          return acc;
        }
        const isSymmetric = IRelation.isSymmetric(ecRelation);
        if (
          pcsStatement.role === StatementRole.PREMISE &&
          (isSymmetric || ecRelation.to === ec)
        ) {
          acc.push({
            relationType: transformToArgumentRelationType(
              ecRelation.relationType
            ),
            from: other(ecRelation, ec),
            to: member,
            type: ArgdownTypes.RELATION,
            occurrences: []
          });
        } else if (
          pcsStatement.role === StatementRole.MAIN_CONCLUSION &&
          (isSymmetric || ecRelation.from === ec)
        ) {
          acc.push({
            relationType: transformToArgumentRelationType(
              ecRelation.relationType
            ),
            from: member,
            to: other(ecRelation, ec),
            type: ArgdownTypes.RELATION,
            occurrences: []
          });
        }
        return acc;
      }, acc);
      if (isConclusion(pcsStatement)) {
        if (pcsStatement.inference && pcsStatement.inference.relations) {
          const inferenceRelations = [
            ...pcsStatement.inference.relations,
            ...deriveImplicitRelations(
              pcsStatement.inference,
              statementsMap,
              argumentsMap
            )
          ];
          acc.push(
            ...inferenceRelations.map(inferenceRelation => ({
              ...inferenceRelation,
              to: member
            }))
          );
        }
      }
      return acc;
    }, implicitRelations);
  }
  return implicitRelations;
};
