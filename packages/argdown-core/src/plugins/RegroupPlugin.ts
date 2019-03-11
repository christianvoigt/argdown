import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
import { checkResponseFields } from "../ArgdownPluginError";
import { IArgdownRequest, IArgdownResponse } from "../index";
import { ArgdownTypes, ISection } from "../model/model";
import { IGroupSettings, ISectionConfig } from "./GroupPlugin";
import { isObject } from "../utils";
/**
 * Applies the regroup group setting by deleting all sections derived from headings and creating new ones based on the settings.
 *
 * Transforms the response.sections field and the section property of arguments and equivalence classes.
 * This plugin should be run before the [[ColorPlugin]]
 */
export class RegroupPlugin implements IArgdownPlugin {
  name = "RegroupPlugin";
  getSettings = (request: IArgdownRequest): IGroupSettings => {
    if (isObject(request.group)) {
      return request.group;
    } else {
      request.group = {};
      return request.group;
    }
  };
  run: IRequestHandler = (request, response) => {
    const settings = this.getSettings(request);
    if (settings.regroup && settings.regroup.length) {
      checkResponseFields(this, response, [
        "statements",
        "arguments",
        "relations"
      ]);

      response.sections = [];
      for (let ec of Object.values(response.statements!)) {
        ec.section = null;
      }
      for (let a of Object.values(response.arguments!)) {
        a.section = null;
      }
      for (let i = 0; i < settings.regroup.length; i++) {
        const sectionConfig = settings.regroup[i];
        if (!isObject(sectionConfig)) {
          continue;
        }
        const section = regroupRecursively(sectionConfig, response, 1, i);
        response.sections.push(section);
      }
    }
  };
}
const regroupRecursively = (
  sectionConfig: ISectionConfig,
  response: IArgdownResponse,
  sectionLevel: number,
  sectionCounter: number,
  parentSection?: ISection
): ISection => {
  const newSection: ISection = {
    type: ArgdownTypes.SECTION,
    id: "s" + sectionCounter,
    level: sectionLevel,
    title: sectionConfig.title,
    tags: sectionConfig.tags,
    children: [],
    isClosed: sectionConfig.isClosed
  };
  if (parentSection) {
    newSection.parent = parentSection;
  }
  sectionCounter++;
  if (sectionConfig.statements) {
    for (let statementTitle of sectionConfig.statements) {
      const ec = response.statements![statementTitle];
      if (ec) {
        ec.section = newSection;
      }
    }
  }
  if (sectionConfig.arguments) {
    for (let argumentTitle of sectionConfig.arguments) {
      const ec = response.arguments![argumentTitle];
      if (ec) {
        ec.section = newSection;
      }
    }
  }
  if (sectionConfig.children) {
    for (let i = 0; i < sectionConfig.children.length; i++) {
      const child = sectionConfig.children[i];
      const childSection = regroupRecursively(
        child,
        response,
        sectionLevel + 1,
        sectionCounter + i,
        newSection
      );
      newSection.children.push(childSection);
    }
  }
  return newSection;
};
