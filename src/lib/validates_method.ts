import { ActiveHashRecord, EagerQueryable } from "activehashie";
import isInteger = require("lodash.isinteger");
import uniq = require("lodash.uniq");
// eslint-disable-next-line import/first
import { ModelValidationErrorReports } from "./model_validation_error_report";

/** validatesで利用できるメソッド名と引数の対応 */
export interface ValidatesMethods {
    presence: ValidatesMethod.Params.Presence;
    presenceBelongsTo: ValidatesMethod.Params.Presence;
    uniqueness: ValidatesMethod.Params.Uniqueness;
    length: ValidatesMethod.Params.Length;
    format: ValidatesMethod.Params.Format;
    numericality: ValidatesMethod.Params.Numericality;
    inclusion: ValidatesMethod.Params.Inclusion;
    exclusion: ValidatesMethod.Params.Exclusion;
}

export namespace ValidatesMethod {
    /** validatesで利用できるメソッド引数 */
    export namespace Params {
        export type Presence = true;
        export type Uniqueness = true;
        export interface Length {
            minimum?: number;
            maximum?: number;
            is?: number;
        }
        export interface Format {
            with?: RegExp;
            without?: RegExp;
        }
        export type Numericality =
            | true
            | {
                  only_integer?: boolean;
                  greater_than?: number;
                  greater_than_or_equal_to?: number;
                  equal_to?: number;
                  less_than?: number;
                  less_than_or_equal_to?: number;
              };
        export interface Inclusion {
            in: any[];
        }
        export interface Exclusion {
            in: any[];
        }
    }

    /** validatesで利用できるメソッド */
    export namespace Method {
        /** 存在チェック */
        export function presence<Record extends ActiveHashRecord>(
            errors: ModelValidationErrorReports<Record>,
            _: ValidatesMethod.Params.Presence,
            model: EagerQueryable<Record>,
            column: keyof Record,
        ) {
            const ids = model.where({ [column]: null } as any).pluck("id");
            if (ids.length !== 0) errors.push({ column, ids, message: "nullであるデータが存在します" });
        }

        /** 関連を考慮した存在チェック */
        export function presenceBelongsTo<Record extends ActiveHashRecord>(
            errors: ModelValidationErrorReports<Record>,
            _: ValidatesMethod.Params.Presence,
            model: EagerQueryable<Record>,
            column: keyof Record,
        ) {
            const ids = model.where({ [column]: [null, undefined] } as any).pluck("id");
            if (ids.length !== 0) errors.push({ column, ids, message: "参照先がないデータが存在します" });
        }

        /** ユニーク性チェック */
        export function uniqueness<Record extends ActiveHashRecord>(
            errors: ModelValidationErrorReports<Record>,
            _: ValidatesMethod.Params.Uniqueness,
            model: EagerQueryable<Record>,
            column: keyof Record,
        ) {
            if (uniq(model.pluck(column)).length !== model.length) {
                const valuesMap = new Map<any, number>();
                const idsMap = new Map<any, number[]>();
                for (const record of model.toArray()) {
                    const value = record[column];
                    valuesMap.set(value, (valuesMap.get(value) || 0) + 1);
                    let ids = idsMap.get(value);
                    if (!ids) {
                        ids = [];
                        idsMap.set(value, ids);
                    }
                    ids.push(record.id);
                }
                for (const [value, count] of valuesMap.entries()) {
                    if (count > 1) {
                        const ids = idsMap.get(value);
                        errors.push({ column, ids, message: `値[${value}]がユニークではありません` });
                    }
                }
            }
        }

        /** 長さチェック */
        export function length<Record extends ActiveHashRecord>(
            errors: ModelValidationErrorReports<Record>,
            params: ValidatesMethod.Params.Length,
            model: EagerQueryable<Record>,
            column: keyof Record,
        ) {
            const records = model.not({ [column]: null } as any);
            if (params.is != null) {
                const ids = records.filterByColumn(column, (value: any) => value.length !== params.is).pluck("id");
                if (ids.length) errors.push({ column, ids, message: `値が${params.is}ではありません` });
            }
            if (params.minimum != null) {
                const ids = records
                    .filterByColumn(column, (value: any) => value.length < (params.minimum as number))
                    .pluck("id");
                if (ids.length) errors.push({ column, ids, message: `値が${params.minimum}より小さいです` });
            }
            if (params.maximum != null) {
                const ids = records
                    .filterByColumn(column, (value: any) => value.length > (params.maximum as number))
                    .pluck("id");
                if (ids.length) errors.push({ column, ids, message: `値が${params.maximum}より大きいです` });
            }
        }

        /** 文字列フォーマットチェック */
        export function format<Record extends ActiveHashRecord>(
            errors: ModelValidationErrorReports<Record>,
            params: ValidatesMethod.Params.Format,
            model: EagerQueryable<Record>,
            column: keyof Record,
        ) {
            const ids = model
                .not({ [column]: null } as any)
                .filterByColumn(column, (value: any) => {
                    if (params.with && !params.with.test(value)) return false;
                    if (params.without && params.without.test(value)) return false;
                    return true;
                })
                .pluck("id");
            if (ids.length) {
                errors.push({ column, ids, message: "フォーマットに反しています" });
            }
        }

        /** 数値チェック */
        export function numericality<Record extends ActiveHashRecord>(
            errors: ModelValidationErrorReports<Record>,
            params: ValidatesMethod.Params.Numericality,
            model: EagerQueryable<Record>,
            column: keyof Record,
        ) {
            const records = model.not({ [column]: null } as any);
            const nanIds = records
                // eslint-disable-next-line no-restricted-globals
                .filterByColumn(column, (value: any) => typeof value !== "number" || isNaN(value))
                .pluck("id");
            if (nanIds.length) {
                errors.push({ column, ids: nanIds, message: "数値でないデータが存在します" });
            }
            if (params === true) return;
            if (params.only_integer) {
                const ids = records.filterByColumn(column, (value) => !isInteger(value)).pluck("id");
                if (ids.length) errors.push({ column, ids, message: "整数値でないデータが存在します" });
            }
            if (params.equal_to != null) {
                const ids = records.not({ [column]: params.equal_to } as any).pluck("id");
                if (ids.length)
                    errors.push({ column, ids, message: `[${params.equal_to}]と等しくないデータが存在します` });
            }
            if (params.greater_than != null) {
                const ids = records
                    .filterByColumn(column, (value: any) => value <= (params.greater_than as number))
                    .pluck("id");
                if (ids.length)
                    errors.push({ column, ids, message: `[${params.greater_than}]以下のデータが存在します` });
            }
            if (params.greater_than_or_equal_to != null) {
                const ids = records
                    .filterByColumn(column, (value: any) => value < (params.greater_than_or_equal_to as number))
                    .pluck("id");
                if (ids.length)
                    errors.push({
                        column,
                        ids,
                        message: `[${params.greater_than_or_equal_to}]より小さいデータが存在します`,
                    });
            }
            if (params.less_than != null) {
                const ids = records
                    .filterByColumn(column, (value: any) => value >= (params.less_than as number))
                    .pluck("id");
                if (ids.length) errors.push({ column, ids, message: `[${params.less_than}]以上のデータが存在します` });
            }
            if (params.less_than_or_equal_to != null) {
                const ids = records
                    .filterByColumn(column, (value: any) => value > (params.less_than_or_equal_to as number))
                    .pluck("id");
                if (ids.length)
                    errors.push({
                        column,
                        ids,
                        message: `[${params.less_than_or_equal_to}]より大きいデータが存在します`,
                    });
            }
        }

        /** 範囲内チェック */
        export function inclusion<Record extends ActiveHashRecord>(
            errors: ModelValidationErrorReports<Record>,
            params: ValidatesMethod.Params.Inclusion,
            model: EagerQueryable<Record>,
            column: keyof Record,
        ) {
            const ids = model.not({ [column]: params.in } as any).pluck("id");
            if (ids.length) errors.push({ column, ids, message: `[${params.in}]以外のデータが存在します` });
        }

        /** 範囲外チェック */
        export function exclusion<Record extends ActiveHashRecord>(
            errors: ModelValidationErrorReports<Record>,
            params: ValidatesMethod.Params.Exclusion,
            model: EagerQueryable<Record>,
            column: keyof Record,
        ) {
            const ids = model.where({ [column]: params.in } as any).pluck("id");
            if (ids.length) errors.push({ column, ids, message: `[${params.in}]にあたるデータが存在します` });
        }
    }
}
