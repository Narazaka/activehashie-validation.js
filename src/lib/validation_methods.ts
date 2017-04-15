import {ActiveHashRecord, ActiveHashRecordFilter, EagerQueryable, Queryable} from "activehashie";
import {ActiveHashValidation} from "./active_hash_validation";
import {ModelValidationErrorReports} from "./model_validation_error_report";
import {ValidatesMethod, ValidatesMethods} from "./validates_method";

export interface ValidationMethodsCondition<Record extends ActiveHashRecord> {
    if?: ActiveHashRecordFilter<Record>;
    unless?: ActiveHashRecordFilter<Record>;
}

export class ValidationMethods<Record extends ActiveHashRecord> {
    private model: EagerQueryable<Record>;
    private validation: ActiveHashValidation;
    private errors: ModelValidationErrorReports<Record>;

    constructor(model: Queryable<Record>, validation: ActiveHashValidation) {
        this.model = model.eager();
        this.validation = validation;
        this.errors = new ModelValidationErrorReports(model, validation);
        this.validates = this.validates.bind(this);
        this.validate = this.validate.bind(this);
    }

    validates<ValidatesMethod extends keyof ValidatesMethods>(
        column: keyof Record,
        method: ValidatesMethod,
        params: ValidatesMethods[ValidatesMethod],
        condition: ValidationMethodsCondition<Record> = {},
    ) {
        const model = this.filterModelByCondition(condition);
        switch (method) {
            case "presence":
                return ValidatesMethod.Method.presence(this.errors, params as any, model, column);
            case "presenceBelongsTo":
                return ValidatesMethod.Method.presenceBelongsTo(this.errors, params as any, model, column);
            case "uniqueness":
                return ValidatesMethod.Method.uniqueness(this.errors, params as any, model, column);
            case "length":
                return ValidatesMethod.Method.length(this.errors, params as any, model, column);
            case "format":
                return ValidatesMethod.Method.format(this.errors, params as any, model, column);
            case "numericality":
                return ValidatesMethod.Method.numericality(this.errors, params as any, model, column);
            case "inclusion":
                return ValidatesMethod.Method.inclusion(this.errors, params as any, model, column);
            case "exclusion":
                return ValidatesMethod.Method.exclusion(this.errors, params as any, model, column);
            default:
                throw new Error(`${method} is not validates method`);
        }
    }

    validate(
        validator: (errors: ModelValidationErrorReports<Record>, model: EagerQueryable<Record>) => void,
        condition: ValidationMethodsCondition<Record> = {},
    ) {
        const model = this.filterModelByCondition(condition);
        validator(this.errors, model);
    }

    private filterModelByCondition(condition: ValidationMethodsCondition<Record>) {
        let model = this.model;
        if (condition.if) model = model.filter(condition.if);
        if (condition.unless)
            model = model.filter((record) => !(condition.unless as ActiveHashRecordFilter<Record>)(record));
        return model;
    }
}
