import { ActiveHashRecord } from "activehashie";
import { validate } from "activehashie-validation";
import { ApplicationRecord } from "./application_record";
import { Item } from "./item";

export class ItemGroupRecord extends ActiveHashRecord {
    name: string;

    get items() {
        return this.hasMany(Item);
    }
}

export const ItemGroup = new ApplicationRecord("ItemGroup", ItemGroupRecord);

validate(ItemGroup, ({ validates }) => {
    validates("name", "presence", true);
    validates("name", "uniqueness", true);
});
