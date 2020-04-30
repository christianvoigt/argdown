#!/usr/bin/env node

const pandoc = require("pandoc-filter-promisified");
const action = require("../dist/index.js");

pandoc.stdio(action);
