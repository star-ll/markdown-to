"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMd = exports.parseDir = exports.markdownIt = void 0;
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const markdown_it_1 = __importDefault(require("markdown-it"));
const util_1 = require("./util");
exports.markdownIt = new markdown_it_1.default({
    typographer: true,
    linkify: true,
    langPrefix: "mdto-",
    xhtmlOut: true,
});
/**
 *  根据rootDir递归地读取markdown文件，将文件目录等信息转换成特定的对象结构Mds
 * */
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
                const translateDic = config.translateDic || {};
                /** 翻译文件名*/
                if (util_1.chineseRegex.test(o.title)) {
                    const title = o.title;
                    const tran = translateDic[title] ||
                        (await config.translate?.(o.title));
                    o.title_en = tran?.replace(/\s/g, "_") || title;
                    !translateDic[title] && (translateDic[title] = tran);
                }
                /** 翻译目录*/
                if (!Array.isArray(o.categories_en)) {
                    o.categories_en = [];
                }
                for (let i = 0; i < o.categories.length; i++) {
                    const category = o.categories[i];
                    if (util_1.chineseRegex.test(category)) {
                        const tran = translateDic[category] ||
                            (await config.translate?.(category));
                        o.categories_en[i] =
                            tran?.replace(/\s/g, "_") || category;
                        !translateDic[category] &&
                            (translateDic[category] = tran);
                    }
                    else {
                        o.categories_en[i] = o.categories[i];
                    }
                }
            }
            md.push(o);
        }
    }
    return md;
}
exports.parseDir = parseDir;
/** 在Md对象基础上递归读取markdown内容并转换成html*/
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
        }
    }
    return mdArr;
}
exports.parseMd = parseMd;
