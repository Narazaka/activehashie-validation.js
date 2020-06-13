import {ActiveHashRecord, Queryable} from "activehashie";
import {ValidationMethods} from "./validation_methods";

/** バリデーションエラーレポート */
export interface ValidationErrorReport<Record extends ActiveHashRecord> {
    /** モデル */
    model: Queryable<Record>;
    /** カラム */
    column?: keyof Record;
    /** ID */
    ids?: number[];
    /** エラーメッセージ */
    message: string;
}

/** バリデーションエラーレポート群 */
export type ValidationErrorReports = ValidationErrorReport<any>[];

/** バリデーションを記述する関数 */
export type ValidationsFunction<Record extends ActiveHashRecord> =
    /**
     * @param v 汎用のvalidatesメソッドとカスタム定義のvalidateメソッド
     */
    (v: ValidationMethods<Record>) => void;

/**
 * バリデーション情報を管理する
 */
export class ActiveHashValidation {
    /** バリデートで検出されたエラー */
    errors: ValidationErrorReports = [];

    /** コンストラクタ */
    constructor() {
        this.validate = this.validate.bind(this);
        this.errorMessages = this.errorMessages.bind(this);
    }

    /**
     * モデルをバリデートする
     * @param model モデル
     * @param validations バリデーションを記述する関数
     */
    validate<Record extends ActiveHashRecord>(
        model: Queryable<Record>,
        validations: ValidationsFunction<Record>,
    ) {
        const validationMethods = new ValidationMethods(model, this);
        validationMethods.validates("id", "presence", true);
        validationMethods.validates("id", "uniqueness", true);
        validations(validationMethods);
    }

    /** バリデートで検出されたエラーメッセージ */
    errorMessages() {
        return this.errors.map(
            (error) =>
                `テーブル[${error.model.name}]のレコードID=${error.ids} カラム[${error.column as string}]において ${error.message}`,
        );
    }
}

/** バリデーションのインスタンス */
export const activeHashValidation = new ActiveHashValidation();

/** モデルをバリデートする */
export const validateModel = activeHashValidation.validate;
