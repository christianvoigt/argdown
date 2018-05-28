import * as _ from "lodash";
import { Argument } from "../model/Argument.js";
import { EquivalenceClass } from "../model/EquivalenceClass.js";

class JSONExport {
    constructor(config) {
        let defaultSettings = {
            spaces: 2,
            removeEmbeddedRelations: false,
            exportMap: true,
            exportSections: true,
            exportTags: true
        };
        this.defaults = _.defaultsDeep({}, config, defaultSettings);
        this.name = "JSONExport";
    }
    getSettings(request) {
        if (request.json) {
            return request.json;
        } else if (request.JSONExport) {
            return request.JSONExport;
        } else {
            request.json = {};
            return request.json;
        }
    }
    prepare(request) {
        _.defaultsDeep(this.getSettings(request), this.defaults);
    }
    run(request, response) {
        const argdown = {
            arguments: response.arguments,
            statements: response.statements,
            relations: response.relations
        };
        const settings = this.getSettings(request);
        if (settings.exportMap && response.map && response.map.nodes && response.map.edges) {
            argdown.map = {
                nodes: response.map.nodes,
                edges: response.map.edges
            };
        }
        if (settings.exportSections && response.sections) {
            argdown.sections = response.sections;
        }
        if (settings.exportTags && response.tags && response.tagsDictionary) {
            argdown.tags = response.tags;
            argdown.tagsDictionary = response.tagsDictionary;
        }
        response.json = JSON.stringify(
            argdown,
            function(key, value) {
                if (
                    settings.removeEmbeddedRelations &&
                    key == "relations" &&
                    (this instanceof Argument || this instanceof EquivalenceClass)
                ) {
                    return undefined;
                }

                if (
                    !settings.exportSections &&
                    key == "section" &&
                    (this instanceof Argument || this instanceof EquivalenceClass)
                ) {
                    return undefined;
                }

                return value;
            },
            settings.spaces
        );
        return response;
    }
}
module.exports = {
    JSONExport: JSONExport
};
