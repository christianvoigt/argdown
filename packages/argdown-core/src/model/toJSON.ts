import {
  ArgdownTypes,
  IRelation,
  ISection,
  IMapEdge,
  IMapNode,
  IStatement,
  IArgument,
  IGroupMapNode,
  IEquivalenceClass,
  IInference
} from "./model";
import { isObject } from "../utils";
const prepareEquivalenceClassForJSON = (s: IEquivalenceClass): any => {
  let copy: any = Object.assign({}, s);
  if (copy.section) {
    copy.section = copy.section.id;
  }
  return copy;
};
const prepareStatementForJSON = (s: IStatement): any => {
  let copy: any = Object.assign({}, s);
  if (copy.section) {
    copy.section = copy.section.id;
  }
  return copy;
};
/**
 * Substitutes sections with their ids.
 */
const prepareArgumentForJSON = (a: IArgument) => {
  let copy: any = Object.assign({}, a);
  if (copy.section) {
    copy.section = copy.section.id;
  }
  return copy;
};
const prepareMapEdgeForJSON = (e: IMapEdge) => {
  let edge: any = { id: e.id, type: e.type, relationType: e.relationType };
  if (e.from) {
    edge.from = e.from.id;
  }
  if (e.to) {
    edge.to = e.to.id;
  }
  if (e.fromEquivalenceClass) {
    edge.fromEquivalenceClass = e.fromEquivalenceClass.title;
  }
  if (e.toEquivalenceClass) {
    edge.toEquivalenceClass = e.toEquivalenceClass.title;
  }
  return edge;
};
const prepareMapNodeForJSON = (n: IMapNode) => {
  let node = {
    id: n.id,
    title: n.title,
    type: n.type,
    labelTitle: n.labelTitle,
    labelText: n.labelText,
    tags: n.tags,
    color: n.color,
    fontColor: n.fontColor
  };
  return node;
};
const prepareGroupMapNodeForJSON = (n: IGroupMapNode) => {
  let node = {
    id: n.id,
    title: n.title,
    type: n.type,
    color: n.color,
    fontColor: n.fontColor,
    isClosed: n.isClosed,
    level: n.level,
    labelTitle: n.labelTitle,
    labelText: n.labelText,
    children: n.children,
    parent: n.parent
  };
  return node;
};
const prepareRelationForJSON = (r: IRelation): any => {
  let rel: any = {
    type: r.type,
    relationType: r.relationType
  };

  if (r.from) {
    rel.from = r.from.title;
    rel.fromType = r.from.type;
  }

  if (r.to) {
    rel.to = r.to.title;
    rel.toType = r.to.type;
  }
  if (r.to!.type === ArgdownTypes.INFERENCE) {
    rel.to = (<IInference>r.to).argumentTitle!;
    rel.conclusionIndex = (<IInference>r.to).conclusionIndex;
  }

  return rel;
};
/**
 * Substitutes parent with parent's id.
 */
const prepareSectionForJSON = (s: ISection) => {
  let copy: any = Object.assign({}, s);
  if (copy.parent) {
    copy.parent = copy.parent.id;
  }
  if (copy.heading) {
    delete copy.heading;
  }
  return copy;
};
export const jsonReplacer = (_key: string, value: any): any => {
  if (value && value.type) {
    switch (value.type) {
      case ArgdownTypes.ARGUMENT:
        return prepareArgumentForJSON(value);
      case ArgdownTypes.ARGUMENT_MAP_NODE:
        return prepareMapNodeForJSON(value);
      case ArgdownTypes.EQUIVALENCE_CLASS:
        return prepareEquivalenceClassForJSON(value);
      case ArgdownTypes.GROUP_MAP_NODE:
        return prepareGroupMapNodeForJSON(value);
      case ArgdownTypes.INFERENCE:
        return value;
      case ArgdownTypes.MAP_EDGE:
        return prepareMapEdgeForJSON(value);
      case ArgdownTypes.RELATION:
        return prepareRelationForJSON(value);
      case ArgdownTypes.RULE_NODE:
        return value;
      case ArgdownTypes.SECTION:
        return prepareSectionForJSON(value);
      case ArgdownTypes.STATEMENT:
        return prepareStatementForJSON(value);
      case ArgdownTypes.STATEMENT_MAP_NODE:
        return prepareMapNodeForJSON(value);
      default:
        return value;
    }
  }
  return value;
};
export const prepareForJSON = (obj: any): any => {
  if (isObject(obj)) {
    const data = jsonReplacer("", obj);
    for (let key of Object.keys(data)) {
      data[key] = prepareForJSON(data[key]);
    }
    return data;
  } else if (Array.isArray(obj)) {
    const arr = [];
    for (let e of obj) {
      arr.push(prepareForJSON(e));
    }
    return arr;
  } else {
    return obj;
  }
};
export const stringifyArgdownData = (
  obj: object,
  replacer?: ((key: string, value: any) => any) | undefined | null,
  space?: number
): string => {
  const wrapper = (key: string, value: any) => {
    if (replacer) {
      return jsonReplacer(key, replacer(key, value));
    }
    return jsonReplacer(key, value);
  };
  return JSON.stringify(obj, wrapper, space);
};
