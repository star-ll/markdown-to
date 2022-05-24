"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const google_translate_api_1 = __importDefault(require("@vitalets/google-translate-api"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const markdown_it_1 = __importDefault(require("markdown-it"));
const highlight_js_1 = __importDefault(require("highlight.js")); // https://highlightjs.org/
const markdownIt = new markdown_it_1.default({
    typographer: true,
    linkify: true,
    langPrefix: "mdto-",
    xhtmlOut: true,
    highlight: function (str, lang) {
        if (lang && highlight_js_1.default.getLanguage(lang)) {
            try {
                return highlight_js_1.default.highlight(str, { language: lang }).value;
            }
            catch (__) { }
        }
        return ""; // use external default escaping
    },
});
class MarkdownTo {
    constructor(rootDir, outDir, config) {
        this.isTranslate = false;
        this.mds = [];
        this.isTranslate =
            config.isTranslate || process.argv.includes("--translate");
        this.rootDir = path_1.default.resolve(rootDir);
        this.template = (0, fs_1.readFileSync)(path_1.default.resolve(`./preset/preset.${config.type}`), {
            encoding: "utf-8",
        });
        this.outBaseDir = path_1.default.resolve(outDir);
        this.outDir = path_1.default.join(this.outBaseDir, config.type);
        this.config = config;
    }
    async render() {
        await this.check();
        await this.start();
    }
    check() {
        // 检查输出目录，如果输出目录不存在则创建
        (0, promises_1.rm)(this.outBaseDir, { recursive: true, force: true })
            .then(() => (0, promises_1.access)(this.outBaseDir), (err) => { })
            .catch(() => (0, promises_1.mkdir)(this.outBaseDir))
            .then(() => (0, promises_1.access)(this.outDir))
            .catch(() => (0, promises_1.mkdir)(this.outDir));
    }
    start() {
        (0, promises_1.stat)(this.rootDir)
            .then((res) => {
            if (!res.isDirectory()) {
                throw new Error("rootDir不是一个目录");
            }
            return (0, promises_1.readdir)(this.rootDir);
        }, () => {
            console.error("rootDir根目录不存在或路径错误");
        })
            .then((fileNames) => {
            if (!Array.isArray(fileNames) || fileNames?.length <= 0) {
                throw new Error("空目录");
            }
            console.time("解析文件信息");
            return this.parsePath(fileNames, this.rootDir);
        })
            .then((res) => {
            console.timeEnd("解析文件信息");
            console.time("输出map.json");
            this.mds.push(...res);
            (0, fs_1.writeFileSync)("./map.json", JSON.stringify(this.mds));
            console.timeEnd("输出map.json");
            return res;
        })
            .then((res) => {
            console.time("解析Markdown");
            return this.parseMd(res);
        })
            .then((res) => {
            console.timeEnd("解析Markdown");
            console.time("输出文件");
            return this.generateFile(res);
        })
            .then(() => {
            console.timeEnd("输出文件");
        })
            .catch((err) => {
            console.error(err);
        });
    }
    async parsePath(files, baseDir = this.rootDir) {
        const md = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filePath = path_1.default.join(baseDir, file);
            if (this.config.ignores.includes(file)) {
                continue;
            }
            const fileStat = await (0, promises_1.stat)(filePath);
            if (fileStat.isDirectory()) {
                const filePaths = await (0, promises_1.readdir)(filePath);
                const parseResult = await this.parsePath(filePaths, filePath);
                if (parseResult?.length > 0)
                    md.push(parseResult);
            }
            else if (fileStat.isFile() && this.config.md.test(file)) {
                const o = {
                    path: filePath,
                    categories: path_1.default
                        .relative(this.rootDir, baseDir)
                        .split(path_1.default.normalize("//")),
                    title: path_1.default.basename(file).replace(path_1.default.extname(file), ""),
                    createTime: fileStat.birthtime,
                    updateTime: fileStat.mtime,
                };
                if (this.isTranslate === true) {
                    if (!/^[a-zA-z0-9_\-]+$/.test(o.title)) {
                        const title = o.title;
                        let tran = await this.translate(o.title);
                        o.title_en = tran?.replace(/\s/g, "_") || title;
                    }
                    for (let i = 0; i < o.categories.length; i++) {
                        const category = o.categories[i];
                        if (!/^[a-zA-z0-9_\-]+$/.test(category)) {
                            let tran = await this.translate(category);
                            o.categories[i] =
                                tran?.replace(/\s/g, "_") || category;
                        }
                    }
                }
                md.push(o);
            }
        }
        return md;
    }
    async parseMd(mdArr) {
        // 解析markdown
        for (let i = 0; i < mdArr.length; i++) {
            const mdObj = mdArr[i];
            if (Array.isArray(mdObj)) {
                await this.parseMd(mdObj);
            }
            else {
                const content = await (0, promises_1.readFile)(mdObj.path, {
                    encoding: "utf-8",
                });
                mdObj.parseContent = JSON.stringify(markdownIt.render(content));
                if (["tsx", "jsx"].includes(this.config.type)) {
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
    async generateFile(mdArr) {
        for (let i = 0; i < mdArr.length; i++) {
            const mdObj = mdArr[i];
            if (Array.isArray(mdObj)) {
                await this.generateFile(mdObj);
            }
            else {
                const categories = mdObj.categories;
                // 创建目录
                let dirPath = path_1.default.resolve(this.outDir);
                for (let i = 0; i < categories.length; i++) {
                    const category = categories[i];
                    dirPath = path_1.default.join(dirPath, category);
                    try {
                        await (0, promises_1.access)(dirPath);
                    }
                    catch {
                        await (0, promises_1.mkdir)(dirPath);
                    }
                }
                let content = this.template;
                content = content.replace("{- html -}", mdObj.parseContent ? JSON.parse(mdObj.parseContent) : "");
                await (0, promises_1.writeFile)(path_1.default.join(dirPath, `${mdObj.title_en || mdObj.title}.${this.config.type}`), content, {
                    encoding: "utf-8",
                    flag: "w+",
                });
            }
        }
        return mdArr;
    }
    translate(q) {
        if (!q) {
            return "";
        }
        return (0, google_translate_api_1.default)(q, { to: "en" })
            .then((res) => {
            console.log(q + "  =>  " + res.text);
            return res.text;
        })
            .catch((err) => {
            console.error(q, "\n", err);
        });
    }
}
exports.default = MarkdownTo;
