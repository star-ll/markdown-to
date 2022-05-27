"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presetTemplate = void 0;
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
