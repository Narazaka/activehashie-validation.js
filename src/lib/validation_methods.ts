import { ActiveHashRecord, ActiveHashRecordFilter, EagerQueryable, Queryable } from "activehashie";
import { ActiveHashValidation } from "./active_hash_validation";
import { ModelValidationErrorReports } from "./model_validation_error_report";
import { ValidatesMethod, ValidatesMethods } from "./validates_method";

/** バリデート時の絞り込み */
export interface ValidationMethodsCondition<Record extends ActiveHashRecord> {
    /** trueならレコードを含める */
    if?: ActiveHashRecordFilter<Record>;
    /** trueならレコードを除く */
    unless?: ActiveHashRecordFilter<Record>;
}

/** カスタムバリデーター */
export type CustomValidator<Record extends ActiveHashRecord> =
    /**
     * @param errors エラーを追加するオブジェクト エラーがあればこのオブジェクトにpushする
     * @param model 絞り込まれたレコード群
     */
    (errors: ModelValidationErrorReports<Record>, model: EagerQueryable<Record>) => void;

/** バリデーションを記述する関数に渡されるvalidatesとvalidate */
export class ValidationMethods<Record extends ActiveHashRecord> {
    private model: EagerQueryable<Record>;

    private errors: ModelValidationErrorReports<Record>;

    /**
     * コンストラクタ
     * @param model 適用するモデル
     * @param validation バリデーション情報を管理するオブジェクト
     */
    constructor(model: Queryable<Record>, validation: ActiveHashValidation) {
        this.model = model.eager();
        this.errors = new ModelValidationErrorReports(model, validation);
        this.validates = this.validates.bind(this);
        this.validate = this.validate.bind(this);
    }

    /**
     * 汎用のバリデーターでバリデーションする
     *
     * ActiveModel::Validations::ClassMethods#validates相当
     * @param column カラム
     * @param method バリデーション方法
     * @param params バリデーション方法による引数
     * @param condition ifあるいはunlessによる絞り込み
     */
    // tslint:disable-next-line no-shadowed-variable
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

    /**
     * カスタムのバリデーション方法でバリデートする
     *
     * ActiveModel::Validations::ClassMethods#validate(ブロック渡し)相当
     * @param validator カスタムバリデーター
     * @param condition ifあるいはunlessによる絞り込み
     */
    validate(validator: CustomValidator<Record>, condition: ValidationMethodsCondition<Record> = {}) {
        const model = this.filterModelByCondition(condition);
        validator(this.errors, model);
    }

    private filterModelByCondition(condition: ValidationMethodsCondition<Record>) {
        let { model } = this;
        if (condition.if) model = model.filter(condition.if);
        if (condition.unless)
            model = model.filter((record) => !(condition.unless as ActiveHashRecordFilter<Record>)(record));
        return model;
    }
}
