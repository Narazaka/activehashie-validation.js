/* tslint:disable:variable-name max-classes-per-file */
import test from "ava";
import {activeHashValidation, validate} from "../lib";
import {Item} from "./util";

test("basic queries", (t) => {
    validate(Item, ({validates}) => {
        validates("name", "presence", true);
        validates("name", "uniqueness", true);
        validates("type", "presence", true);
    });

    // tslint:disable-next-line no-shadowed-variable
    validate(Item, ({validate}) => {
        validate((errors, _) => {
            errors.push({column: "name", ids: [11, 12], message: "fails"});
        });
    });

    validate(Item, ({validates}) => {
        validates("item_group_id", "uniqueness", true);
    });
    t.is(activeHashValidation.errors.length, 3);
});
