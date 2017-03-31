import {ActiveHashRecord, Queryable} from "activehashie";
import {ValidationMethods} from "./validation_methods";

export type ValidationErrorReport<Record extends ActiveHashRecord> = {
    model: Queryable<Record>, column?: keyof Record, ids?: number[], message: string,
};

export type ValidationErrorReports = Array<ValidationErrorReport<any>>;

export class ActiveHashValidation {
    errors: ValidationErrorReports = [];

    constructor() {
        this.validate = this.validate.bind(this);
        this.errorMessages = this.errorMessages.bind(this);
    }

    validate<Record extends ActiveHashRecord>(
        model: Queryable<Record>,
        validations: (v: ValidationMethods<Record>) => void,
    ) {
        const validationMethods = new ValidationMethods(model, this);
        validationMethods.validates("id", "presence", true);
        validationMethods.validates("id", "uniqueness", true);
        validations(validationMethods);
    }

    errorMessages() {
        return this.errors.map(
            (error) =>
                `テーブル[${error.model.name}]のレコードID=${error.ids} カラム[${error.column}]において ${error.message}`,
        );
    }
}

export const activeHashValidation = new ActiveHashValidation();
export const validate = activeHashValidation.validate;
