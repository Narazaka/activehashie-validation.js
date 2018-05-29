import { SchemaTable, SchemaTableColumn } from "./schema_table";

const joinLines = (lines: string[]) => lines.map((line) => `${line}\n`).join("");

export class ModelGenerator {
    tables: SchemaTable[];
    private readonly tableGenerators: SchemaTableModelGenerator[];

    constructor(tables: SchemaTable[]) {
        this.tables = tables;
        this.tableGenerators = tables.map((table) => new SchemaTableModelGenerator(table));
    }

    toModelCode() {
        return [
            `import {ActiveHash, ActiveHashRecord} from "activehashie";`,
            ``,
            `// tslint:disable max-classes-per-file no-empty-interface variable-name max-line-length`,
            ``,
            this.toModelCodeMain(),
        ].join("\n");
    }

    toDelarationCode() {
        return [
            `import * as Extensions from "./Extensions";`,
            `import * as Models from "./Models";`,
            ``,
            `// tslint:disable max-classes-per-file no-empty-interface variable-name max-line-length`,
            ``,
            this.toDeclarationCodeMain(),
        ].join("\n");
    }

    toModelCodeMain() {
        return this.tableGenerators.map((g) => g.toModelCode()).join("\n");
    }

    toDeclarationCodeMain() {
        return this.tableGenerators.map((g) => g.toDeclarationCode()).join("\n");
    }
}

// tslint:disable max-classes-per-file
export class SchemaTableModelGenerator {
    table: SchemaTable;

    constructor(table: SchemaTable) {
        this.table = table;
    }

    toModelCode() {
        return [
            this.recordClassCode(),
            this.tableClassCode(),
            this.tableConstantCode(),
        ].join("\n");
    }

    toDeclarationCode() {
        return [
            this.declareCode(),
        ].join("\n");
    }

    tableConstantCode() {
        return joinLines([
            ...(this.table.comment ? [`/** ${this.table.comment} */`] : []),
            `export const ${this.table.baseClassName} = new ${this.table.tableClassName}();`,
        ]);
    }

    tableClassCode() {
        return joinLines(
            [
                ...(this.table.comment ? [`/** ${this.table.comment} */`] : []),
                `export class ${this.table.tableClassName} extends ActiveHash<${this.table.recordClassName}> {`,
                `    constructor() {`,
                `        super("${this.table.baseClassName}", ${this.table.recordClassName});`,
                `    }`,
                `}`,
            ],
        );
    }

    recordClassCode() {
        return joinLines([
            ...(this.table.comment ? [`/** ${this.table.comment} */`] : []),
            `export class ${this.table.recordClassName} extends ActiveHashRecord {`,
            ...this.table.columns.map(this.columnPropertyCode),
            `}`,
        ]);
    }

    columnPropertyCode(column: SchemaTableColumn) {
        return [
            column.comment ? `    /** ${column.comment} */\n` : "",
            `    ${column.name}${column.null ? "?" : ""}: ${column.type};`,
        ].join("");
    }

    declareCode() {
        return joinLines([
            `declare module "./Models" {`,
            `    interface ${this.table.tableClassName} extends Extensions.${this.table.tableExtClassName} { }`,
            `    interface ${this.table.recordClassName} extends Extensions.${this.table.recordExtClassName} { }`,
            `}`,
            ``,
            `declare module "./Extensions" {`,
            ...(this.table.comment ? [`    /** ${this.table.comment} extension */`] : []),
            `    interface ${this.table.tableExtClassName} { }`,
            ...(this.table.comment ? [`    /** ${this.table.comment} extension */`] : []),
            `    interface ${this.table.recordExtClassName} { }`,
            `}`,
        ]);
    }
}
