import {
  IRelation,
  RelationMember,
  IEquivalenceClass,
  IArgument,
  ArgdownTypes,
  StatementRole,
  IPCSStatement
} from "../model/model";

export const otherRelationMemberIsInSelection = (
  relation: IRelation,
  relationMember: RelationMember,
  selectedStatements: Map<string, IEquivalenceClass>,
  selectedArguments: Map<string, IArgument>
) => {
  return relationMemberIsInSelection(
    relation,
    other(relation, relationMember),
    selectedStatements,
    selectedArguments
  );
};
export const relationMemberIsInSelection = (
  relation: IRelation,
  relationMember: RelationMember,
  selectedStatements: Map<string, IEquivalenceClass>,
  selectedArguments: Map<string, IArgument>
) => {
  if (relationMember.type === ArgdownTypes.EQUIVALENCE_CLASS) {
    if (selectedStatements.get(relationMember.title!)) {
      return true;
    }
    const isSymmetric = IRelation.isSymmetric(relation);
    let role = StatementRole.MAIN_CONCLUSION;
    if (relation.to === relationMember) {
      role = StatementRole.PREMISE;
    }
    return (
      undefined !==
      relationMember.members.find(
        s =>
          (isSymmetric || s.role === role) &&
          selectedArguments.get((<IPCSStatement>s).argumentTitle!) !== undefined
      )
    );
  } else if (
    relationMember.type === ArgdownTypes.ARGUMENT &&
    selectedArguments.get(relationMember.title!)
  ) {
    return true;
  } else if (
    relationMember.type === ArgdownTypes.INFERENCE &&
    selectedArguments.get(relationMember.argumentTitle!)
  ) {
    return true;
  }
  return false;
};
export const other = (r: IRelation, e: RelationMember) => {
  return r.from === e ? r.to! : r.from!;
};
