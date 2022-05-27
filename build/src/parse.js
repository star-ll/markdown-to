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
// eslint-disable-next-line no-irregular-whitespace
const HTML_ESCAPE_TEST_RE = /[&<>"{}]/;
// eslint-disable-next-line no-irregular-whitespace
const HTML_ESCAPE_REPLACE_RE = /[&<>"{}]/g;
const HTML_REPLACEMENTS = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "{": "&#123",
    "}": "&#125",
};
function replaceUnsafeChar(ch) {
    return HTML_REPLACEMENTS[ch];
}
function escapeHtml(str) {
    if (HTML_ESCAPE_TEST_RE.test(str)) {
        return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
    }
    return str;
}
exports.markdownIt = new markdown_it_1.default({
    typographer: true,
    linkify: true,
    langPrefix: "mdto-",
    xhtmlOut: true,
    highlight: function (str, lang) {
        if (lang && highlight_js_1.default.getLanguage(lang)) {
            try {
                return ('<pre class="hljs"><code>' +
                    highlight_js_1.default.highlight(escapeHtml(str), {
                        language: lang,
                        ignoreIllegals: true,
                    }).value +
                    "</code></pre>");
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
                if (typeof config.translate !== "function") {
                    throw new Error("translate不是一个函数");
                }
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
            mdObj.parseContent = exports.markdownIt
                .render(content)
                .replace(/\u200B/g, "")
                .replace(/\u00a0/g, "");
            // if (mdObj.parseContent && ["tsx", "jsx"].includes(config.type)) {
            // 	console.log(true);
            // 	mdObj.parseContent
            // 		.replace(/<code>\{/g, "<code>{`")
            // 		.replace(/\}<\/code>/, "`}</code>");
            // }
        }
    }
    return mdArr;
}
exports.parseMd = parseMd;
