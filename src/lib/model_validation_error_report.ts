import {ActiveHashRecord, Queryable} from "activehashie";
import {ActiveHashValidation} from "./active_hash_validation";

export interface ModelValidationErrorReport<Record extends ActiveHashRecord> {
    column?: keyof Record;
    ids?: number[];
    message: string;
}

export class ModelValidationErrorReports<Record extends ActiveHashRecord> {
    private model: Queryable<Record>;
    private validation: ActiveHashValidation;

    constructor(model: Queryable<Record>, validation: ActiveHashValidation) {
        this.model = model;
        this.validation = validation;
        this.push = this.push.bind(this);
    }

    push(...reports: Array<ModelValidationErrorReport<Record>>) {
        for (const report of reports) {
            this.validation.errors.push(
                {model: this.model, column: report.column, ids: report.ids, message: report.message},
            );
        }
    }
}
