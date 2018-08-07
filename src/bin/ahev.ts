#!/usr/bin/env node
import * as commander from "commander";
import {FileSystemObject} from "fso";
import * as path from "path";
import {
    activeHashValidation,
    generateHtmlReport,
    styleSheet,
} from "../lib";
/* tslint:disable no-console */
/* tslint:disable no-var-requires */
require("ts-node/register");
const version = require("../../package.json").version;

const program = commander.
    version(version).
    usage("[options] <file or directory ...>").
    option("-e, --extension [extensions]", "extensions ex. \".ts,.js\"", (value) => value.split(","), [".ts"]).
    option("-o, --out [path]", "html report file path", "report.html").
    option("-c, --css [filename]", "css filename (or inline stylesheet)", "").
    parse(process.argv);

function filesReqursive(entries: string[], extentions = [".ts"]) {
    // tslint:disable-next-line no-shadowed-variable
    const files = [];
    for (const entry of entries) {
        const entrypath = new FileSystemObject(entry);
        if (!entrypath.existsSync()) continue;
        if (entrypath.isDirectorySync()) {
            files.push(
                ...entrypath.childrenAllSync().filter((filepath) => extentions.indexOf(filepath.extname()) !== -1),
            );
        } else {
            files.push(entrypath);
        }
    }
    return files;
}

const files = filesReqursive(program.args.length ? program.args : ["spec", "models"], (program as any).extension);
if (!files.length) program.help();
for (const file of files) {
    const filePath = file.path;
    require(/^[\/.]/.test(filePath) ? filePath : path.join(process.cwd(), filePath));
}

const cssFileName = (program as any).css;
const htmlFile = new FileSystemObject((program as any).out);
htmlFile.writeFileSync(generateHtmlReport(activeHashValidation.errors, !cssFileName));
if (cssFileName) {
    const cssFile = new FileSystemObject(cssFileName);
    cssFile.writeFileSync(styleSheet);
}

if (activeHashValidation.errors.length) {
    activeHashValidation.errorMessages().forEach((message) => {
        console.error("----------------------------------------");
        console.error(message);
    });
    console.error("データにエラーがあります");
    process.exit(1);
} else {
    console.info("全チェック項目問題ありませんでした");
}
