"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.presetHightLight = exports.presetTemplate = void 0;
const util_1 = require("./util");
const highlight_js_1 = __importDefault(require("highlight.js")); // https://highlightjs.org/
function presetTemplate(content, type) {
    const presetList = {
        html: `<!DOCTYPE html>
            <html lang="zh">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>文章</title>
            </head>
            <body>
                ${content}
            </body>
            </html>`,
        vue: `<template>
            <div>${content}</div>
            </template>
            <script></script>
            <style></style>
            `,
        jsx: `export default function Article() {
                return <>${content}</>;
            }
            `,
        tsx: `export default function Article() {
            return <>${content}</>;
            }
            `,
    };
    return presetList[type];
}
exports.presetTemplate = presetTemplate;
function presetHightLight(type) {
    if (["tsx", "jsx"].includes(type)) {
        return function (str, lang) {
            if (lang && highlight_js_1.default.getLanguage(lang)) {
                try {
                    return ('<pre class="hljs"><code>' +
                        highlight_js_1.default.highlight(str, {
                            language: lang,
                            ignoreIllegals: true,
                        }).value +
                        "</code></pre>");
                }
                catch (err) {
                    console.error("highlight error\n" + err);
                }
            }
            return ('<pre class="hljs"><code>' + (0, util_1.escapeHtml)(`str`) + "</code></pre>"); // use external default escaping
        };
        return function (str, lang) {
            if (lang && highlight_js_1.default.getLanguage(lang)) {
                try {
                    return ('<pre class="hljs"><code>{`' +
                        highlight_js_1.default
                            .highlight(str.slice(2, -2), {
                            language: lang,
                            ignoreIllegals: true,
                        })
                            .value.replace(/[^\\]`/g, "\\`") +
                        "`}</code></pre>");
                }
                catch (err) {
                    console.error("highlight error\n" + err);
                }
            }
            return ('<pre class="hljs"><code>{`' +
                `${(0, util_1.escapeHtml)(str).replace(/[^\\]`/g, "\\`")}` +
                "`}</code></pre>"); // use external default escaping
        };
    }
    return function (str, lang) {
        if (lang && highlight_js_1.default.getLanguage(lang)) {
            try {
                return ('<pre class="hljs"><code>' +
                    highlight_js_1.default.highlight(str, {
                        language: lang,
                        ignoreIllegals: true,
                    }).value +
                    "</code></pre>");
            }
            catch (__) {
                //
            }
        }
        return '<pre class="hljs"><code>' + (0, util_1.escapeHtml)(str) + "</code></pre>";
    };
}
exports.presetHightLight = presetHightLight;
