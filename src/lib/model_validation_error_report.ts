import {ActiveHashRecord, Queryable} from "activehashie";
import {ActiveHashValidation} from "./active_hash_validation";

/** 個別モデルのバリデーションエラーレポート */
export interface ModelValidationErrorReport<Record extends ActiveHashRecord> {
    /** カラム */
    column?: keyof Record;
    /** ID */
    ids?: number[];
    /** エラーメッセージ */
    message: string;
}

/** 個別モデルのバリデーションエラーレポート群 */
export class ModelValidationErrorReports<Record extends ActiveHashRecord> {
    private model: Queryable<Record>;
    private validation: ActiveHashValidation;

    /**
     * コンストラクタ
     * @param model 適用するモデル
     * @param validation バリデーション情報を管理するオブジェクト
     */
    constructor(model: Queryable<Record>, validation: ActiveHashValidation) {
        this.model = model;
        this.validation = validation;
        this.push = this.push.bind(this);
    }

    /**
     * 個別モデルのバリデーションエラーレポートを追加する
     * @param reports 個別モデルのバリデーションエラーレポート
     */
    push(...reports: Array<ModelValidationErrorReport<Record>>) {
        for (const report of reports) {
            this.validation.errors.push(
                {model: this.model, column: report.column, ids: report.ids, message: report.message},
            );
        }
    }
}
