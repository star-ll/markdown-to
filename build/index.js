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
let translateDic;
try {
    const translateDictionary = (0, fs_1.readFileSync)(path_1.default.resolve("./cache/translate.json"), { encoding: "utf-8" });
    translateDic = JSON.parse(translateDictionary);
}
catch (__) {
    translateDic = {};
}
class MarkdownTo {
    /**
     *
     * @param rootDir 根目录
     * @param outDir 输出目录
     * @param config 配置对象 {@link Config}
     */
    constructor(rootDir, outDir, config = {}) {
        this.mds = [];
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
        this.outBaseDir = path_1.default.resolve(outDir);
        this.outDir = path_1.default.join(this.outBaseDir, config.type || "vue");
        this.config = {
            md: config.md || /\.md$/,
            type: config.type || "vue",
            ignores: config.ignores || [],
            rootDir: this.rootDir || "./",
            outDir: this.outDir || "./dist",
            toc: config.toc || false,
            isTranslate: config.isTranslate ||
                process.argv.includes("--translate") ||
                false,
            translate: typeof config.translate === "function"
                ? config.translate
                : translate_1.translate,
            translateDic: translateDic || {},
        };
        this.mdRules();
    }
    async render() {
        await this.check();
        await this.start();
    }
    check() {
        // 检查输出目录，如果输出目录不存在则创建
        (0, promises_1.rm)(this.outBaseDir, { recursive: true, force: true })
            .then(() => (0, promises_1.access)(this.outBaseDir))
            .catch(() => (0, promises_1.mkdir)(this.outBaseDir))
            .then(() => (0, promises_1.access)(this.outDir))
            .catch(() => (0, promises_1.mkdir)(this.outDir));
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
        (0, fs_1.writeFileSync)(`./dist/toc.${this.config.type}`, (0, presetList_1.presetTemplate)(list, this.config.type), {
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
        // toc目录
        if (this.config.toc)
            await (0, menu_1.createMdToc)(mds);
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
            const isJSX = ["tsx", "jsx"].includes(this.config.type);
            // markdownIt.renderer.rules.code_block = function (
            // 	tokens,
            // 	idx,
            // 	option,
            // 	env,
            // 	slf
            // ) {
            // 	const token = tokens[idx];
            // 	let content = escapeHtml(tokens[idx].content);
            // 	let attr = slf.renderAttrs(token);
            // 	if (isJSX) {
            // 		content = `{\`${content}\`}`;
            // 		attr = attr
            // 			.replace(/class/g, "className")
            // 			.replace(/style=(['"]).*?\1/g, "");
            // 	}
            // 	return "<pre" + attr + "><code>" + content + "</code></pre>\n";
            // };
            parse_1.markdownIt.renderer.rules.code_inline = function (tokens, idx, options, env, slf) {
                const token = tokens[idx];
                let attr = slf.renderAttrs(token);
                if (isJSX) {
                    tokens[idx].content = `{\`${tokens[idx].content.replace(/`/g, "\\`")}\`}`;
                    attr = attr
                        .replace(/class/g, "className")
                        .replace(/style=(['"])(.*?)\1/g, (match) => (0, util_1.transformStyle)(match.slice(7, -1)));
                }
                return "<code" + attr + ">" + tokens[idx].content + "</code>";
            };
            const fence = parse_1.markdownIt.renderer.rules.fence;
            parse_1.markdownIt.renderer.rules.fence = function escape_renderer(tokens, idx, options, env, slf) {
                if (isJSX) {
                    const content = tokens[idx].content;
                    tokens[idx].content =
                        "{`" + content.replace(/`/g, "\\`") + "`}";
                    return fence(tokens, idx, options, env, slf)
                        .replace(/class="/g, 'className="')
                        .replace(/style=(['"])(.*?)\1/g, (match) => (0, util_1.transformStyle)(match.slice(7, -1)));
                }
                return fence(tokens, idx, options, env, slf);
            };
            console.log(parse_1.markdownIt.renderer.rules);
        }
    }
}
exports.MarkdownTo = MarkdownTo;
