import * as _ from "lodash";
import utils from "../utils.js";

class TagPlugin {
    constructor(config) {
        let defaultSettings = {
            colorScheme: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666"]
        };
        this.defaults = _.defaultsDeep({}, config, defaultSettings);
        this.name = "TagPlugin";
        this.config = config;
    }
    getSettings(request) {
        if (!request.tagPlugin) {
            request.tagPlugin = {};
        }
        return request.tagPlugin;
    }
    prepare(request) {
        const settings = this.getSettings(request);
        _.defaultsDeep(settings, this.defaults);
        if (request.tagColorScheme) {
            settings.colorScheme = request.tagColorScheme;
        }
        if (request.tags) {
            settings.tags = request.tags;
        }
    }
    run(request, response) {
        if (!response.tags || !response.statements || !response.arguments) {
            return;
        }
        response.tagsDictionary = {};

        let selectedTags = response.tags;
        const settings = this.getSettings(request);
        if (settings.tags) {
            selectedTags = [];
            for (let tagData of settings.tags) {
                selectedTags.push(tagData.tag);
            }
        }
        for (let tag of response.tags) {
            let tagData = null;
            if (settings.tags) {
                let tagConfig = _.find(request.tags, { tag: tag });
                tagData = _.clone(tagConfig);
            }
            if (!tagData) {
                tagData = { tag: tag };
            }
            response.tagsDictionary[tag] = tagData;
            let index = selectedTags.indexOf(tag);
            tagData.cssClass = utils.stringToClassName("tag-" + tag);
            if (index > -1) {
                if (!tagData.color && index < settings.colorScheme.length) {
                    tagData.color = settings.colorScheme[index];
                }
                tagData.cssClass += " tag" + index;
                tagData.index = index;
            }
        }
        for (let title of Object.keys(response.statements)) {
            let equivalenceClass = response.statements[title];
            if (equivalenceClass.tags) {
                equivalenceClass.sortedTags = this.sortTags(equivalenceClass.tags, response);
            }
        }
        for (let title of Object.keys(response.arguments)) {
            let argument = response.arguments[title];
            if (argument.tags) {
                argument.sortedTags = this.sortTags(argument.tags, response);
            }
        }
    }
    sortTags(tags, response) {
        const filtered = _.filter(tags, function(tag) {
            return response.tagsDictionary[tag].index != null;
        });
        const sorted = _.sortBy(filtered, function(tag) {
            return response.tagsDictionary[tag].index;
        });
        return sorted;
    }
}
module.exports = {
    TagPlugin: TagPlugin
};
