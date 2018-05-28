import { SchemaTable, SchemaTableColumn } from "./schema_table";

const joinLines = (lines: string[]) => lines.map((line) => `${line}\n`).join("");

export class ModelGenerator {
    static generate(tables: SchemaTable[]) {
        return [
            `import {ActiveHash, ActiveHashRecord} from "activehashie";`,
            `import * as Extensions from "./Extensions";`,
            ``,
            `// tslint:disable max-classes-per-file no-empty-interface variable-name max-line-length`,
            ``,
            this.generateTables(tables),
        ].join("\n");
    }

    static generateTables(tables: SchemaTable[]) {
        return tables.map(this.generateTable).join("\n");
    }

    static generateTable(table: SchemaTable) {
        return new SchemaTableModelGenerator(table).generate();
    }
}

// tslint:disable max-classes-per-file
export class SchemaTableModelGenerator {
    table: SchemaTable;

    constructor(table: SchemaTable) {
        this.table = table;
    }

    generate() {
        return [
            this.generateRecordClass(),
            this.generateTableClass(),
            this.generateTableConstant(),
            this.generateExtensionDeclare(),
        ].join("\n");
    }

    generateTableConstant() {
        return joinLines([
            ...(this.table.comment ? [`/** ${this.table.comment} */`] : []),
            `export const ${this.table.baseClassName} = new ${this.table.tableClassName}();`,
        ]);
    }

    generateTableClass() {
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

    generateRecordClass() {
        return joinLines([
            ...(this.table.comment ? [`/** ${this.table.comment} */`] : []),
            `export class ${this.table.recordClassName} extends ActiveHashRecord {`,
            ...this.table.columns.map(this.generateColumnProperty),
            `}`,
        ]);
    }

    generateColumnProperty(column: SchemaTableColumn) {
        return [
            column.comment ? `    /** ${column.comment} */\n` : "",
            `    ${column.name}${column.null ? "?" : ""}: ${column.type};`,
        ].join("");
    }

    generateExtensionDeclare() {
        return joinLines([
            `export interface ${this.table.tableClassName} extends Extensions.${this.table.tableExtClassName} { }`,
            `export interface ${this.table.recordClassName} extends Extensions.${this.table.recordExtClassName} { }`,
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
