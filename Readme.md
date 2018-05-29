# [activehashie-validation.js - The ActiveModel like validation for ActiveHashie](https://github.com/Narazaka/activehashie-validation.js)

[![npm](https://img.shields.io/npm/v/activehashie-validation.svg)](https://www.npmjs.com/package/activehashie-validation)
[![npm license](https://img.shields.io/npm/l/activehashie-validation.svg)](https://www.npmjs.com/package/activehashie-validation)
[![npm download total](https://img.shields.io/npm/dt/activehashie-validation.svg)](https://www.npmjs.com/package/activehashie-validation)
[![npm download by month](https://img.shields.io/npm/dm/activehashie-validation.svg)](https://www.npmjs.com/package/activehashie-validation)

[![Dependency Status](https://david-dm.org/Narazaka/activehashie-validation.js/status.svg)](https://david-dm.org/Narazaka/activehashie-validation.js)
[![devDependency Status](https://david-dm.org/Narazaka/activehashie-validation.js/dev-status.svg)](https://david-dm.org/Narazaka/activehashie-validation.js?type=dev)
[![Travis Build Status](https://travis-ci.org/Narazaka/activehashie-validation.js.svg?branch=master)](https://travis-ci.org/Narazaka/activehashie-validation.js)
[![AppVeyor Build Status](https://ci.appveyor.com/api/projects/status/github/Narazaka/activehashie-validation.js?svg=true&branch=master)](https://ci.appveyor.com/project/Narazaka/activehashie-validation-js)
[![codecov.io](https://codecov.io/github/Narazaka/activehashie-validation.js/coverage.svg?branch=master)](https://codecov.io/github/Narazaka/activehashie-validation.js?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/1254af9b5a1c480892df28e817fe9219)](https://www.codacy.com/app/narazaka/activehashie-validation-js?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Narazaka/activehashie-validation.js&amp;utm_campaign=Badge_Grade)
[![Greenkeeper badge](https://badges.greenkeeper.io/Narazaka/activehashie-validation.js.svg)](https://greenkeeper.io/)

Rails等のマスターデータをJavaScript/TypeScriptでチェック可能にするツールです。

## 使用方法

`rails_app/db/seeds.rb`にてデータをテーブルごとにymlファイルから読み込む仕組みになっているとします。

下記のように`checker/`にチェック用の内容を書いて、`checker/`フォルダで`ahev`コマンドを実行すると、エラー内容が記載された`report.html`が生成されます。

なおこの内容はexamples/の下にあります。

`rails_app/db/seeds/items.yml`:

```yaml
data1:
  id: 1
  name: item1
  type: a
  item_group_id: 1
data2:
  id: 2
  name: item2
  type: a
  item_group_id: 1
data3:
  id: 3
  name: item3
  type: b
  item_group_id: 2
data4:
  id: 4
  name: item3
  type: c
  item_group_id: 2
```

`rails_app/db/seeds/item_groups.yml`:

```yaml
data1:
  id: 1
  name: group1
data2:
  id: 2
  name: group2
data3:
  id: 3
  name: group2
```

`checker/models/application_record.ts`:

```typescript
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
```

`checker/models/item.ts`:

```typescript
import {ActiveHashRecord} from "activehashie";
import {validate} from "activehashie-validation";
import {ApplicationRecord} from "./application_record";
import {ItemGroup, ItemGroupRecord} from "./item_group";

export class ItemRecord extends ActiveHashRecord {
    name: string;
    type: "a" | "b";
    item_group_id: number;
    get itemGroup(): ItemGroupRecord | undefined { return this.belongsTo(ItemGroup); }

    displayName() {
        const itemGroup = this.itemGroup;
        return `${itemGroup ? itemGroup.name : ""} - ${this.name} [${this.type}]`;
    }
}

export const Item = new ApplicationRecord("Item", ItemRecord);

validate(Item, ({validates, validate}) => {
    validates("name", "presence", true);
    validates("name", "uniqueness", true);
    validates("type", "presence", true);
    validate((errors, model) => {
        const ids = model.where().not({type: ["a", "b"]}).pluck("id");
        if (ids.length) {
            errors.push({column: "type", ids, message: "typeは'a', 'b'のいずれかであるべきです"});
        }
    });
    validates("itemGroup", "presenceBelongsTo", true); // 参照先の存在をチェックします
});
```

`checker/models/item_group.ts`:

```typescript
import {ActiveHashRecord} from "activehashie";
import {validate} from "activehashie-validation";
import {ApplicationRecord} from "./application_record";
import {Item} from "./item";

export class ItemGroupRecord extends ActiveHashRecord {
    name: string;
    get items() { return this.hasMany(Item); }
}

export const ItemGroup = new ApplicationRecord("ItemGroup", ItemGroupRecord);

validate(ItemGroup, ({validates}) => {
    validates("name", "presence", true);
    validates("name", "uniqueness", true);
});
```

`checker/spec/length.ts`:

```typescript
import {validate} from "activehashie-validation";
import "../models/item";
import {ItemGroup} from "../models/item_group";

validate(ItemGroup, ({validate}) => {
    validate((errors, model) => {
        if (model.length < 10) {
            errors.push({message: "ItemGroupは10個以上必要です"});
        }
    });
});
```

## 自動生成

`db/schema.rb`からTypeScriptコードを自動生成できます。

```bash
npx generate-model-ar-schema ./db/schema.rb ../checker
```

以下のファイルが生成されます

- ApplicationTable.ts (同名ファイルがなければ生成 テーブルのベースクラスファイル)
- Models.ts (テーブルの定義ファイル)
- Extensions.ts (同名ファイルがなければ生成 テーブルの拡張メソッドを定義するためのファイル)
- ModelAndExtensions.ts (テーブル拡張メソッドを便利に使うための定義ファイル)

生成されるExtensions.tsに`テーブル名TableExt`（ActiveRecordのscope等）、`テーブル名RecordExt`（ActiveRecordのインスタンスメソッド）を定義していくことができます。

## See also

- [activehashie](https://github.com/Narazaka/activehashie.js)

## License

This is released under [MIT License](http://narazaka.net/license/MIT?2017).
