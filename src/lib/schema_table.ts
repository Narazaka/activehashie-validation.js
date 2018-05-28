import * as camelcase from "camelcase";
import * as pluralize from "pluralize";

const classify = (name: string) => camelcase(pluralize.singular(name), {pascalCase: true} as any);

export type SchemaTableColumnType = "string" | "number" | "boolean" | "Date";

export interface SchemaTableColumn {
    name: string;
    type: SchemaTableColumnType;
    null: boolean;
    comment?: string;
}

export class SchemaTable {
    name: string;
    primaryKey?: string[];
    comment?: string;
    columns: SchemaTableColumn[] = [];
    readonly baseClassName: string;

    constructor(name: string) {
        this.name = name;
        this.baseClassName = classify(this.name);
    }

    get tableClassName() { return `${this.baseClassName}Table`; }
    get recordClassName() { return `${this.baseClassName}Record`; }
    get tableExtClassName() { return `${this.tableClassName}Ext`; }
    get recordExtClassName() { return `${this.recordClassName}Ext`; }
}
