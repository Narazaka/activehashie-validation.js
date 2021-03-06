/* eslint-disable max-classes-per-file */
import { SchemaTable, SchemaTableColumn } from "./schema_table";

const joinLines = (lines: string[]) => lines.map((line) => `${line}\n`).join("");

export class ModelGenerator {
    tables: SchemaTable[];

    private readonly tableGenerators: SchemaTableModelGenerator[];

    constructor(tables: SchemaTable[]) {
        this.tables = tables;
        this.tableGenerators = tables.map((table) => new SchemaTableModelGenerator(table));
    }

    // eslint-disable-next-line class-methods-use-this
    toModelBaseCode() {
        return joinLines([
            `import {ActiveHash, ActiveHashRecord} from "activehashie";`,
            ``,
            `export class ApplicationTable<Record extends ActiveHashRecord> extends ActiveHash<Record> {`,
            `}`,
        ]);
    }

    toModelCode() {
        return [
            `import {ActiveHashRecord} from "activehashie";`,
            `import {ApplicationTable} from "./ApplicationTable";`,
            ``,
            `// tslint:disable max-classes-per-file no-empty-interface variable-name max-line-length`,
            ``,
            `export type ColumnNameOf<T> = Exclude<keyof T, "_parentTable">;`,
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

    toExtensionExampleCode() {
        return [
            `import {applyRecordExtension} from "activehashie-validation";`,
            `import * as Models from "./Models";`,
            ``,
            `// tslint:disable max-classes-per-file`,
            ``,
            this.toExtensionExampleCodeMain(),
        ].join("\n");
    }

    toModelCodeMain() {
        return this.tableGenerators.map((g) => g.toModelCode()).join("\n");
    }

    toDeclarationCodeMain() {
        return this.tableGenerators.map((g) => g.toDeclarationCode()).join("\n");
    }

    toExtensionExampleCodeMain() {
        return this.tableGenerators[0].toExtensionExampleCode();
    }
}

// tslint:disable max-classes-per-file
export class SchemaTableModelGenerator {
    table: SchemaTable;

    constructor(table: SchemaTable) {
        this.table = table;
    }

    toModelCode() {
        return [this.recordClassCode(), this.recordColumnCode(), this.tableClassCode(), this.tableConstantCode()].join(
            "\n",
        );
    }

    toDeclarationCode() {
        return [this.declareCode()].join("\n");
    }

    toExtensionExampleCode() {
        return joinLines([
            `export class ${this.table.tableExtClassName} {`,
            `    foo(this: Models.${this.table.tableClassName}) {`,
            `        return this.all().toArray()[0];`,
            `    }`,
            `}`,
            ``,
            `applyRecordExtension(Models.${this.table.tableClassName}, ${this.table.tableExtClassName});`,
            ``,
            `export class ${this.table.recordExtClassName} {`,
            `    bar(this: Models.${this.table.recordClassName}) {`,
            `        return this._parentTable.name;`,
            `    }`,
            `}`,
            ``,
            `applyRecordExtension(Models.${this.table.recordClassName}, ${this.table.recordExtClassName});`,
        ]);
    }

    tableConstantCode() {
        return joinLines([
            ...(this.table.comment ? [`/** ${this.table.comment} */`] : []),
            `export const ${this.table.baseClassName} = new ${this.table.tableClassName}();`,
        ]);
    }

    tableClassCode() {
        return joinLines([
            ...(this.table.comment ? [`/** ${this.table.comment} */`] : []),
            `export class ${this.table.tableClassName} extends ApplicationTable<${this.table.recordClassName}> {`,
            `    constructor() {`,
            `        super("${this.table.baseClassName}", ${this.table.recordClassName});`,
            `    }`,
            `}`,
        ]);
    }

    recordClassCode() {
        return joinLines([
            ...(this.table.comment ? [`/** ${this.table.comment} */`] : []),
            `export class ${this.table.recordClassName} extends ActiveHashRecord {`,
            ...this.table.columns.map(this.columnPropertyCode),
            `}`,
        ]);
    }

    // eslint-disable-next-line class-methods-use-this
    columnPropertyCode(column: SchemaTableColumn) {
        return [
            column.comment ? `    /** ${column.comment} */\n` : "",
            `    ${column.name}${column.null ? "?" : ""}: ${column.type};`,
        ].join("");
    }

    recordColumnCode() {
        return joinLines([
            ...(this.table.comment ? [`/** ${this.table.comment} column name */`] : []),
            `export type ${this.table.recordColumnTypeName} = ColumnNameOf<${this.table.recordClassName}>;`,
        ]);
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
