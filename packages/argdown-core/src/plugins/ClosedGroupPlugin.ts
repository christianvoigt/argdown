import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { ArgdownPluginError } from "../ArgdownPluginError";
import { IArgdownResponse } from "../index";
import {
  isGroupMapNode,
  IMapNode,
  IGroupMapNode,
  IMapEdge
} from "../model/model";

/**
 * Looks for closed group nodes in the map, removes their children and transforms relations
 * that are entering or leaving the group to incoming and outgoing relations of the group node.
 *
 * Internal relations between group descendants are removed from the map.
 *
 * This transformation is only needed for map views that do not support
 * hiding group members and transforming relations of closed groups "out of the box".
 *
 * This plugin has to be run after the [[GroupPlugin]]. It transforms the map field of the response object.
 */
export class ClosedGroupPlugin implements IArgdownPlugin {
  name = "ClosedGroupPlugin";
  run: IRequestHandler = (_request, response) => {
    if (!response.map) {
      throw new ArgdownPluginError("No map field in response.");
    }
    for (let node of response.map.nodes) {
      closeGroupsRecursively(node, response);
    }
  };
}
const closeGroupsRecursively = (
  currentNode: IMapNode,
  response: IArgdownResponse
) => {
  if (isGroupMapNode(currentNode)) {
    if (currentNode.isClosed) {
      closeGroup(currentNode, response);
    } else if (currentNode.children) {
      for (let child of currentNode.children) {
        closeGroupsRecursively(child, response);
      }
    }
  }
};
const closeGroup = (node: IGroupMapNode, response: IArgdownResponse) => {
  const descendantsMap = node.children!.reduce(reduceToDescendantsMap, <
    { [key: string]: IMapNode }
  >{});
  node.children = [];
  // filter out internal edges (where source and target are group descendants)
  // transform edges that cross the group border (where either source or target are a group descendant) to relations of the group node
  response.map!.edges = response.map!.edges.reduce(
    (acc, curr) => {
      const fromIsDescendant = !!descendantsMap[curr.from.id];
      const toIsDescendant = !!descendantsMap[curr.to.id];
      if (fromIsDescendant && !toIsDescendant) {
        curr.from = node;
        acc.push(curr);
      } else if (toIsDescendant && !fromIsDescendant) {
        curr.to = node;
        acc.push(curr);
      } else if (!fromIsDescendant && !toIsDescendant) {
        acc.push(curr);
      }
      return acc;
    },
    <IMapEdge[]>[]
  );
};
const reduceToDescendantsMap = (
  acc: { [key: string]: IMapNode },
  curr: IMapNode
) => {
  acc[curr.id] = curr;
  if (isGroupMapNode(curr) && curr.children) {
    curr.children.reduce(reduceToDescendantsMap, acc);
  }
  return acc;
};
