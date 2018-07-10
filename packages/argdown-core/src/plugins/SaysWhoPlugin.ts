import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { ArgdownPluginError } from "../ArgdownPluginError";
import { IMapNode, ArgdownTypes, isGroupMapNode } from "../model/model";
import { IArgdownResponse } from "..";

/**
 * Adds proponents to argument node label text.
 *
 * This is just a simple toy plugin for demonstration purposes.
 * It is used in the Argdown documentation to teach how to write custom plugins.
 **/
export class SaysWhoPlugin implements IArgdownPlugin {
  name: string = "SaysWhoPlugin"; // obligatory plugin name
  // Will be called by the application:
  run: IRequestHandler = (_request, response) => {
    // let's first check that the required data is present in the response:
    if (!response.arguments) {
      throw new ArgdownPluginError(this.name, "Missing argument field in response.");
    }
    if (!response.map) {
      throw new ArgdownPluginError(this.name, "Missing map field in response.");
    }
    // now let's search for all argument nodes and change their label
    for (let node of response.map.nodes) {
      processNodesRecursively(node, response);
    }
  };
}
/**
 * We have to use a recursive method as response.map.nodes may contain groups that can have
 * other groups as children.
 **/
const processNodesRecursively = (node: IMapNode, response: IArgdownResponse): void => {
  if (node.type === ArgdownTypes.ARGUMENT_MAP_NODE) {
    const argument = response.arguments![node.title!];
    // look for the proponent data and change the label
    if (argument && argument.data && argument.data.proponent) {
      const proponent = argument.data.proponent;
      node.labelText = `${proponent}: ${node.labelText}`;
    }
  } else if (isGroupMapNode(node)) {
    for (let child of node.children!) {
      processNodesRecursively(child, response);
    }
  }
};
