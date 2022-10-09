"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownTo = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const menu_1 = require("./src/menu");
const translate_1 = require("./src/translate");
const parse_1 = require("./src/parse");
const file_1 = require("./src/file");
const presetList_1 = require("./src/presetList");
const util_1 = require("./src/util");
const markdown_it_toc_done_right_1 = __importDefault(require("markdown-it-toc-done-right"));
const markdown_it_anchor_1 = __importDefault(require("markdown-it-anchor"));
class MarkdownTo {
    /**
     *
     * @param rootDir 根目录
     * @param outDir 输出目录
     * @param config 配置对象 {@link Config}
     */
    constructor(rootDir, outDir, config = {}) {
        this.mds = [];
        try {
            (0, fs_1.accessSync)(path_1.default.resolve("./cache"));
        }
        catch (__) {
            this.translateDic = {};
            (0, promises_1.mkdir)(path_1.default.resolve("./cache/"));
        }
        try {
            const translateDictionary = (0, fs_1.readFileSync)(path_1.default.resolve("./cache/translate.json"), { encoding: "utf-8" });
            this.translateDic = JSON.parse(translateDictionary);
        }
        catch (__) {
            //
        }
        const res = (0, fs_1.statSync)(rootDir);
        try {
            if (!res?.isDirectory()) {
                console.error("rootDir不是一个目录");
            }
        }
        catch (err) {
            console.error("根目录路径不存在\n", err);
        }
        this.rootDir = path_1.default.resolve(rootDir);
        this.outDir = path_1.default.resolve(outDir);
        this.config = {
            md: config.md || /\.md$/,
            type: config.type || "vue",
            ignores: config.ignores || [],
            rootDir: this.rootDir || "./",
            outDir: this.outDir || "./dist",
            toc: config.toc || {},
            isTranslate: config.isTranslate ||
                process.argv.includes("--translate") ||
                false,
            translate: typeof config.translate === "function"
                ? config.translate
                : translate_1.translate,
            translateDic: this.translateDic || {},
            template: config.template,
        };
        if (!this.config.toc.containerClass) {
            this.config.toc.containerClass = "mdto-toc";
        }
        parse_1.markdownIt.use(markdown_it_anchor_1.default, { tabIndex: false });
        parse_1.markdownIt.use(markdown_it_toc_done_right_1.default, config.toc);
        this.mdRules();
    }
    async render() {
        await this.regenerateDir(this.outDir);
        await this.start();
    }
    /**
     * @function check 检查路径是否存在
     * @param {string} path 文件或目录的绝对路径
     * @return {boolean}  路径是否是文件
     *   */
    async checkPath(path) {
        const fileStat = await (0, promises_1.stat)(path);
        if (fileStat.isFile()) {
            true;
        }
        if (fileStat.isDirectory()) {
            return false;
        }
    }
    async regenerateDir(path) {
        try {
            await this.checkPath(path);
            await (0, promises_1.rm)(path, { recursive: true });
        }
        catch (__) {
            //
        }
        await (0, promises_1.mkdir)(path, { recursive: true });
    }
    /**
     *
     * @param options  配置文件
     */
    async tocFile(options = {}) {
        if (!this.mds || this.mds?.length === 0) {
            const fileNames = await (0, promises_1.readdir)(this.rootDir);
            if (!Array.isArray(fileNames) || fileNames?.length <= 0) {
                throw new Error("空目录");
            }
            this.mds = await (0, parse_1.parseDir)(fileNames, this.rootDir, this.config);
        }
        const tocList = await (0, menu_1.handleToc)(this.mds, options);
        let list = "";
        for (const t of Object.values(tocList)) {
            list += t + "\n";
        }
        list = parse_1.markdownIt.render(list);
        (0, fs_1.writeFileSync)(`./dist/toc.${this.config.type}`, (0, presetList_1.presetTemplate)(list, { type: this.config.type }), {
            flag: "w+",
            encoding: "utf-8",
        });
    }
    async start() {
        const fileNames = await (0, promises_1.readdir)(this.rootDir);
        if (!Array.isArray(fileNames) || fileNames?.length <= 0) {
            throw new Error("空目录");
        }
        console.time("解析文件信息");
        const mds = await (0, parse_1.parseDir)(fileNames, this.rootDir, this.config);
        console.timeEnd("解析文件信息");
        console.time("输出mds.json");
        this.mds.push(...mds);
        (0, fs_1.writeFileSync)(path_1.default.resolve("./cache/mds.json"), JSON.stringify(this.mds));
        console.timeEnd("输出mds.json");
        console.time("解析Markdown");
        await (0, parse_1.parseMd)(mds, this.config);
        console.timeEnd("解析Markdown");
        // 将翻译的字段缓存
        if (this.config.isTranslate) {
            (0, promises_1.writeFile)(path_1.default.resolve("./cache/translate.json"), JSON.stringify(this.config.translateDic || {}), {
                flag: "w+",
                encoding: "utf-8",
            });
        }
        console.time("输出文件");
        await (0, file_1.generateFile)(mds, this.config);
        console.timeEnd("输出文件");
    }
    /**
     * @function 处理markdown解析规则
     */
    mdRules() {
        // 代码高亮
        parse_1.markdownIt.set({ highlight: (0, presetList_1.presetHightLight)(this.config.type) });
        // 转换规则
        if (["tsx", "jsx"].includes(this.config.type)) {
            parse_1.markdownIt.renderer.rules.code_inline = function (tokens, idx, options, env, slf) {
                let attr = slf.renderAttrs(tokens[idx]);
                tokens[idx].content = `{\`${tokens[idx].content.replace(/`/g, "\\`")}\`}`;
                attr = attr.replace(/class/g, "className");
                return "<code " + attr + ">" + tokens[idx].content + "</code>";
            };
            const fence = parse_1.markdownIt.renderer.rules.fence;
            parse_1.markdownIt.renderer.rules.fence = function (tokens, idx, options, env, slf) {
                tokens[idx].content = tokens[idx].content.replace(/`/g, "\\`");
                return fence(tokens, idx, options, env, slf)
                    .replace(/\}/g, "&#125;")
                    .replace(/\{/g, "&#123;")
                    .replace(/class/g, "className")
                    .replace(/\/\//g, "&#47;&#47;")
                    .replace(/\/\*/g, "&#47;&#42;")
                    .replace(/\*\//g, "$1&#42;&#47;")
                    .replace(/'/g, "&quot;")
                    .replace(/\n/g, "<br />");
            };
            /** 解析html属性 */
            parse_1.markdownIt.renderer.renderAttrs = function renderAttrs(token) {
                let i, l, result;
                if (!token.attrs) {
                    return "";
                }
                result = "";
                for (i = 0, l = token.attrs.length; i < l; i++) {
                    let key = token.attrs[i][0];
                    let value = token.attrs[i][1];
                    if (key === "style") {
                        /** JSX style对象 */
                        value = JSON.stringify((0, util_1.transformStyle)((0, util_1.escapeHtml)(value)));
                        result += " " + (0, util_1.escapeHtml)(key) + "=" + `{${value}}`;
                        continue;
                    }
                    if (key === "class") {
                        key = "className";
                    }
                    result +=
                        " " +
                            (0, util_1.transformJSXAttr)((0, util_1.escapeHtml)(key), (0, util_1.escapeHtml)(value));
                }
                return result;
            };
            const tocOptions = this.config.toc;
            parse_1.markdownIt.renderer.rules.tocOpen = function (tokens, idx /* , options, env, renderer */) {
                let _options = { ...tocOptions };
                if (tokens && idx >= 0) {
                    const token = tokens[idx];
                    _options = Object.assign(_options, token.inlineOptions);
                }
                const id = _options.containerId
                    ? ` id="${(0, util_1.escapeHtml)(_options.containerId)}"`
                    : "";
                const containerHeaderHtml = _options.containerHeaderHtml || "";
                return `<nav${id} className="${(0, util_1.escapeHtml)(_options.containerClass)}">${containerHeaderHtml}`;
            };
            parse_1.markdownIt.renderer.rules.tocClose = function () {
                const containerFooterHtml = tocOptions.containerFooterHtml || "";
                return `${containerFooterHtml}</nav>`;
            };
            // console.log(markdownIt.renderer.rules);
            // console.log(markdownIt.renderer.rules.tocClose.toString());
        }
    }
}
exports.MarkdownTo = MarkdownTo;
