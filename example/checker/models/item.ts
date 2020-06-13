import { ActiveHashRecord } from "activehashie";
import { validate } from "activehashie-validation";
import { ApplicationRecord } from "./application_record";
import { ItemGroup, ItemGroupRecord } from "./item_group";

export class ItemRecord extends ActiveHashRecord {
    name: string;

    type: "a" | "b";

    item_group_id: number;

    get itemGroup(): ItemGroupRecord | undefined {
        return this.belongsTo(ItemGroup);
    }

    displayName() {
        const { itemGroup } = this;
        return `${itemGroup ? itemGroup.name : ""} - ${this.name} [${this.type}]`;
    }
}

export const Item = new ApplicationRecord("Item", ItemRecord);

// eslint-disable-next-line no-shadow
validate(Item, ({ validates, validate }) => {
    validates("name", "presence", true);
    validates("name", "uniqueness", true);
    validates("type", "presence", true);
    validate((errors, model) => {
        const ids = model
            .where()
            .not({ type: ["a", "b"] })
            .pluck("id");
        if (ids.length) {
            errors.push({ column: "type", ids, message: "typeは'a', 'b'のいずれかであるべきです" });
        }
    });
    validates("itemGroup", "presenceBelongsTo", true); // 参照先の存在をチェックします
});
