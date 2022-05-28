"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFile = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = require("fs/promises");
const presetList_1 = require("./presetList");
/** 将Mds按照原目录结构生成目标文件*/
async function generateFile(mdArr, config) {
    for (let i = 0; i < mdArr.length; i++) {
        const md = mdArr[i];
        if (Array.isArray(md)) {
            await generateFile(md, config);
        }
        else {
            const categories = md.categories_en || md.categories;
            // 创建目录
            let dirPath = path_1.default.resolve(config.outDir);
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
            let parseContent = md.parseContent;
            // toc
            if (config.toc === true ||
                (Array.isArray(config.toc) && config.toc.includes(md.title))) {
                if (md.toc)
                    parseContent = md.toc + "\n" + parseContent;
            }
            const content = (0, presetList_1.presetTemplate)(parseContent || "", config.type);
            await (0, promises_1.writeFile)(path_1.default.join(dirPath, `${md.title_en || md.title}.${config.type}`), content, {
                encoding: "utf-8",
                flag: "w+",
            });
        }
    }
    return mdArr;
}
exports.generateFile = generateFile;
