import {
    ActiveHashRecord,
    ActiveHashRecordBase,
    ActiveYaml,
} from "activehashie";

const rootPath = "../rails_app/db/seeds";

export class ApplicationRecord<Record extends ActiveHashRecord> extends ActiveYaml<Record> {
    constructor(
        name: string,
        recordClass: new (source: ActiveHashRecordBase) => Record,
        indexColumns?: Array<keyof (Record)>,
    ) {
        super(name, recordClass, {rootPath, indexColumns});
    }
}

// displayNameメソッドを定義しておくと、エラー表示の時にそのレコードを表すものとして使われます。
(<any> ActiveHashRecord.prototype).displayName = function () {
    return this.name;
};
