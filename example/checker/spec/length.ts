import { validate } from "activehashie-validation";
import "../models/item";
import { ItemGroup } from "../models/item_group";

// eslint-disable-next-line no-shadow
validate(ItemGroup, ({ validate }) => {
    validate((errors, model) => {
        if (model.length < 10) {
            errors.push({ message: "ItemGroupは10個以上必要です" });
        }
    });
});
