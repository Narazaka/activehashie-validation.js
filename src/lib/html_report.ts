/* tslint:disable no-console */
import {inspect} from "util";
import {ValidationErrorReports} from "../lib";
import uniq = require("lodash.uniq");

/**
 * HTMLレポートを作る
 * @param errors 検出されたエラー
 * @return HTMLソース
 */
export function generateHtmlReport(errors: ValidationErrorReports) {
    if (!errors.length) {
        return (
            `<!doctype html>
            <html>
            <meta charset="utf-8"><title>データエラー</title>
            <body><h1>全チェック項目問題ありませんでした</h1></body>
            </html>`
        );
    }
    const modelNames = uniq(errors.map((error) => error.model.name));
    const groupedErrors: Array<{modelName: string, errorsByGroup: ValidationErrorReports}> = [];
    for (const modelName of modelNames.sort()) {
        const errorsByGroup = errors.filter((error) => error.model.name === modelName);
        groupedErrors.push({modelName, errorsByGroup});
    }
    return (`
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8">
                <title>データエラー</title>
                <style>
                    * { font-family: Meiryo; line-height: 1.6em; }
                    body { margin: 0; }
                    nav {
                        position: fixed;
                        width: 14em;
                        height: 100%;
                        padding: 1em;
                        color: #eee;
                        background: #333;
                        overflow: auto;
                    }
                    nav ul { margin: 0; }
                    nav a { color: #eee; text-decoration: none; }
                    nav a:hover { text-decoration: underline; }
                    article { margin-left: 16em; padding: 1em; color: #333; }
                    article a { text-decoration: none; }
                    article a:hover { text-decoration: underline; }
                    .index { color: #333; }
                    .index:after { content: ". "; }
                    .column { color: #36f; font-weight: bold; }
                    .message { color: #f33; font-weight: bold; }
                    li { word-wrap: break-word; }
                    table { border-collapse: collapse; }
                    th { background: #eee; }
                    th, td { border: 1px solid black; padding: 0.2em; }
                </style>
            </head>
        <body>
        <nav>
            <h1>データエラー</h1>
            <ul>
            ${
                groupedErrors.map(({modelName, errorsByGroup}) => `
                    <li><a href="#${modelName}">${modelName} (${errorsByGroup.length})</a></li>
                `).join("")
            }
            </ul>
        </nav>
        ${
            groupedErrors.map(({modelName, errorsByGroup}) => `
                <article id="${modelName}">
                    <h2>${modelName}</h2>
                    <ol>
                    ${
                        errorsByGroup.map((error, index) => `
                            <li>
                                <a href="#${modelName}-${index + 1}">
                                    <span class="column">${error.column == null ? "" : error.column}</span>
                                    <span class="message">${error.message}</span>
                                </a>
                            </li>
                        `).join("")
                    }
                    </ol>
                    ${
                        errorsByGroup.map((error, index) => `
                            <section id="${modelName}-${index + 1}">
                                <h3>
                                    <span class="index">${index + 1}</span>
                                    <span class="column">${error.column == null ? "" : error.column}</span>
                                    <span class="message">${error.message}</span>
                                </h3>
                                <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th> </th>
                                        <th>${error.column == null ? "" : error.column}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${
                                        error.model.where({id: error.ids}).toArray().map((record) => `
                                            <tr>
                                                <td>${record.id}</td>
                                                <td>${
                                                    "displayName" in record ?
                                                        (record as any).displayName() :
                                                        inspect(record, false, 0, false)
                                                }</td>
                                                <td>${error.column ? record[error.column] : ""}</td>
                                            </tr>
                                        `).join("")
                                    }
                                </tbody>
                                </table>
                            </section>
                        `).join("")
                    }
                </article>
            `).join("")
        }
        </body>
        </html>
    `);
}
