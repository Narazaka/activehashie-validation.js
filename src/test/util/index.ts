/* eslint-disable max-classes-per-file */
import { ActiveHash, ActiveHashRecord, ActiveHashRelationBase } from "activehashie";

export class ItemGroupRecord extends ActiveHashRecord {
    name: string;

    get items(): ActiveHashRelationBase<ItemRecord> {
        return this.hasMany(Item);
    }
}

export class ItemRecord extends ActiveHashRecord {
    name: string;

    type: string;

    item_group_id: number;

    get itemGroup() {
        return this.belongsTo(ItemGroup);
    }
}

export const ItemGroup = new ActiveHash("ItemGroup", ItemGroupRecord);
export const Item = new ActiveHash("Item", ItemRecord);

Item.setData([
    { id: 11, name: "n11", type: "a", item_group_id: 1 },
    { id: 12, name: "n12", type: "a", item_group_id: 1 },
    { id: 21, name: "n21", type: "a", item_group_id: 2 },
    { id: 22, name: "n22", type: "b", item_group_id: 2 },
    { id: 23, name: "n23", type: "b", item_group_id: 2 },
    { id: 31, name: "n31", type: "b", item_group_id: 3 },
]);

ItemGroup.setData([new ItemGroupRecord({ id: 1, name: "g1" }), new ItemGroupRecord({ id: 2, name: "g2" })]);
