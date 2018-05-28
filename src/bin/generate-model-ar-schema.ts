#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import {parse} from "../lib/active_record_schema_parse";
import {ModelGenerator} from "../lib/model_generator";
/* tslint:disable no-console */

if (process.argv.length !== 4) {
    console.warn("Usage: generate-model-ar-schema db/schema.rb ../check/");
    process.exit(1);
}

const schemaFile = process.argv[2];
const outDir = process.argv[3];

const schema = fs.readFileSync(schemaFile, "utf8");

const model = ModelGenerator.generate(parse(schema));

const modelsFile = path.join(outDir, "Models.ts");
const extensionsFile = path.join(outDir, "Extensions.ts");

fs.writeFileSync(modelsFile, model);
if (!fs.existsSync(extensionsFile)) fs.writeFileSync(extensionsFile, "export {}\n");
