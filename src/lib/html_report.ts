/* tslint:disable no-console */
import {ValidationErrorReports} from "../lib";
import uniq = require("lodash.uniq");

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
    for (const modelName of modelNames) {
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
                    .index { color: #333; }
                    .index:after { content: ". "; }
                    .column { color: #03f; font-weight: bold; }
                    .message { color: #f30; font-weight: bold; }
                    li { word-wrap: break-word }
                    table { border-collapse: collapse }
                    th { background: #ffd }
                    th, td { border: 1px solid black; padding: 0.2em; }
                    nav { position: fixed; width: 16em; }
                    nav ul { margin: 0; }
                    article { margin-left: 17em; }
                </style>
            </head>
        <body>
        <h1>データエラー</h1>
        <nav>
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
                                    <span class="column">${error.column}</span>
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
                                    <span class="column">${error.column}</span>
                                    <span class="message">${error.message}</span>
                                </h3>
                                <table>
                                <thead><tr><th>ID</th><th> </th><th>${error.column}</th></tr></thead>
                                <tbody>
                                    ${
                                        error.model.where({id: error.ids}).toArray().map((record) => `
                                            <tr>
                                                <td>${record.id}</td>
                                                <td>${record.displayName()}</td>
                                                <td>${record[<string> error.column]}</td>
                                            </tr>
                                        `).join("")
                                    }
                                </tbody>
                                </li>
                            </section>
                        `).join("")
                    }
                </section>
            `).join("")
        }
        </body>
        </html>
    `);
}
