#!node
import * as commander from "commander";
import {FileSystemObject} from "fso";
import {
    activeHashValidation,
    generateHtmlReport,
} from "../lib";
/* tslint:disable no-console */
/* tslint:disable no-var-requires */
const version = require("../../package.json").version;

const program = commander.
    version(version).
    usage("[options] <file or directory ...>").
    option("-e, --extension [extensions]", "extensions ex. \".ts,.js\"", (value) => value.split(","), [".ts"]).
    option("-o, --out [path]", "html report file path", "report.html").
    parse(process.argv);

function filesReqursive(entries: string[], extentions = [".ts"]) {
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
for (const file of files) require(file.path);

const htmlFile = new FileSystemObject((program as any).out);
htmlFile.writeFileSync(generateHtmlReport(activeHashValidation.errors));

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
