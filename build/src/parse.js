"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMd = exports.parseDir = exports.markdownIt = void 0;
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const markdown_it_1 = __importDefault(require("markdown-it"));
const highlight_js_1 = __importDefault(require("highlight.js")); // https://highlightjs.org/
exports.markdownIt = new markdown_it_1.default({
    typographer: true,
    linkify: true,
    langPrefix: "mdto-",
    xhtmlOut: true,
    highlight: function (str, lang) {
        if (lang && highlight_js_1.default.getLanguage(lang)) {
            try {
                return highlight_js_1.default.highlight(str, { language: lang }).value;
            }
            catch (__) {
                //
            }
        }
        return ""; // use external default escaping
    },
});
// 解析rootDir，生成mds
async function parseDir(files, baseDir, config) {
    const md = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path_1.default.join(baseDir, file);
        if (Array.isArray(config.ignores) && config.ignores.includes(file)) {
            continue;
        }
        const fileStat = await (0, promises_1.stat)(filePath);
        if (fileStat.isDirectory()) {
            const filePaths = await (0, promises_1.readdir)(filePath);
            const parseResult = await parseDir(filePaths, filePath, config);
            if (parseResult?.length > 0)
                md.push(parseResult);
        }
        else if (fileStat.isFile() && config.md?.test(file)) {
            const o = {
                path: filePath,
                categories: path_1.default
                    .relative(config.rootDir, baseDir)
                    .split(path_1.default.normalize("//")),
                title: path_1.default.basename(file).replace(path_1.default.extname(file), ""),
                createTime: fileStat.birthtime,
                updateTime: fileStat.mtime,
            };
            if (config.isTranslate === true) {
                if (!/^[a-zA-z0-9_-]+$/.test(o.title)) {
                    const title = o.title;
                    const tran = await config.translate?.(o.title);
                    o.title_en = tran?.replace(/\s/g, "_") || title;
                }
                for (let i = 0; i < o.categories.length; i++) {
                    const category = o.categories[i];
                    if (!/^[a-zA-z0-9_-]+$/.test(category)) {
                        const tran = await config.translate?.(category);
                        o.categories[i] = tran?.replace(/\s/g, "_") || category;
                    }
                }
            }
            md.push(o);
        }
    }
    return md;
}
exports.parseDir = parseDir;
async function parseMd(mdArr, config) {
    // 解析markdown
    for (let i = 0; i < mdArr.length; i++) {
        const mdObj = mdArr[i];
        if (Array.isArray(mdObj)) {
            await parseMd(mdObj, config);
        }
        else {
            const content = await (0, promises_1.readFile)(mdObj.path, {
                encoding: "utf-8",
            });
            mdObj.parseContent = JSON.stringify(exports.markdownIt.render(content));
            if (["tsx", "jsx"].includes(config.type)) {
                // jsx中转义{}，替换class
                mdObj.parseContent = mdObj.parseContent
                    .replace(/\{/g, "&#123")
                    .replace(/\}/g, "&#125")
                    .replace(/class/g, "className");
            }
        }
    }
    return mdArr;
}
exports.parseMd = parseMd;
