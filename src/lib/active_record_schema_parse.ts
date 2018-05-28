import { SchemaTable, SchemaTableColumnType } from "./schema_table";

// tslint:disable object-literal-sort-keys

const typeMap: {[name: string]: SchemaTableColumnType} = {
    string: "string",
    text: "string",
    integer: "number",
    bigint: "number",
    boolean: "boolean",
    datetime: "Date",
    date: "Date",
};

export function parse(schema: string) {
    let currentTable: SchemaTable | undefined;
    const tables: SchemaTable[] = [];

    for (const line of schema.split(/\r?\n/)) {
        if (currentTable == null) {
            const createTableMatch = /^\s*create_table "([^"]+)"/.exec(line);
            if (!createTableMatch) continue;
            // テーブルを開く
            currentTable = new SchemaTable(createTableMatch[1]);
            tables.push(currentTable);
            const commentMatch = /comment:\s+"((?:\\\\|\\"|[^"])*)"/.exec(line);
            if (commentMatch) currentTable.comment = commentMatch[1];
            const primaryMatch = /primary_key:\s+(?:\[([^]*)\]|"([^"]+)")/.exec(line);
            if (primaryMatch) {
                if (primaryMatch[1]) {
                    currentTable.primaryKey = primaryMatch[1].split(/,\s*/).map((elem) => elem.replace(/\"/g, ""));
                } else {
                    currentTable.primaryKey = [primaryMatch[2]];
                }
            }
        } else {
            if (/^\s*end\s*$/.test(line)) { // テーブルを閉じる
                currentTable = undefined;
                continue;
            }
            const columnMatch = /^\s*t\.(string|text|bigint|integer|boolean|datetime|date)\s+"([^"]+)"/.exec(line);
            if (!columnMatch) continue;
            const nullMatch = /null:\s+(true|false)/.exec(line);
            const commentMatch = /comment:\s+"((?:\\\\|\\"|[^"])*)"/.exec(line);
            currentTable.columns.push({
                name: columnMatch[2],
                type: typeMap[columnMatch[1]],
                null: nullMatch ? nullMatch[1] !== "false" : true,
                comment: commentMatch ? commentMatch[1] : undefined,
            });
        }
    }

    return tables;
}
