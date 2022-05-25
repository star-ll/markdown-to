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
class MarkdownTo {
    constructor(rootDir, outDir, config = {}) {
        this.mds = [];
        this.handleToc = menu_1.handleToc;
        // 解析rootDir，生成mds
        this.parseDir = parse_1.parseDir;
        this.parseMd = parse_1.parseMd;
        this.generateFile = file_1.generateFile;
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
            template: (0, fs_1.readFileSync)(path_1.default.join(__dirname, `./preset/preset.${config.type}`), {
                encoding: "utf-8",
            }),
        };
        this.template = this.config.template;
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
    async tocFile() {
        if (!this.mds || this.mds?.length === 0) {
            const fileNames = await (0, promises_1.readdir)(this.rootDir);
            if (!Array.isArray(fileNames) || fileNames?.length <= 0) {
                throw new Error("空目录");
            }
            this.mds = await this.parseDir(fileNames, this.rootDir, this.config);
        }
        const tocList = await this.handleToc(this.mds);
        let list = "";
        for (const t of Object.values(tocList)) {
            list += t + "\n";
        }
        list = parse_1.markdownIt.render(list);
        (0, fs_1.writeFileSync)(`./dist/toc.${this.config.type}`, this.template.replace("{- html -}", list || ""), {
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
        const mds = await this.parseDir(fileNames, this.rootDir, this.config);
        console.timeEnd("解析文件信息");
        console.time("输出map.json");
        this.mds.push(...mds);
        (0, fs_1.writeFileSync)("./map.json", JSON.stringify(this.mds));
        console.timeEnd("输出map.json");
        console.time("解析Markdown");
        await this.parseMd(mds, this.config);
        console.timeEnd("解析Markdown");
        console.time("输出文件");
        await this.generateFile(mds, this.config);
        console.timeEnd("输出文件");
    }
}
exports.MarkdownTo = MarkdownTo;
