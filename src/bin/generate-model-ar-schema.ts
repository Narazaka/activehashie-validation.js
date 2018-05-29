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

const modelGenerator = new ModelGenerator(parse(schema));

const applicationTableFile = path.join(outDir, "ApplicationTable.ts");
const modelsFile = path.join(outDir, "Models.ts");
const modelAndExtensionsFile = path.join(outDir, "ModelAndExtensions.ts");
const extensionsFile = path.join(outDir, "Extensions.ts");

if (!fs.existsSync(applicationTableFile)) fs.writeFileSync(applicationTableFile, modelGenerator.toModelBaseCode());
fs.writeFileSync(modelsFile, modelGenerator.toModelCode());
fs.writeFileSync(modelAndExtensionsFile, modelGenerator.toDelarationCode());
if (!fs.existsSync(extensionsFile)) fs.writeFileSync(extensionsFile, modelGenerator.toExtensionExampleCode());
