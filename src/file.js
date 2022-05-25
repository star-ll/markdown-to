"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFile = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = require("fs/promises");
async function generateFile(mdArr, config) {
    for (let i = 0; i < mdArr.length; i++) {
        const mdObj = mdArr[i];
        if (Array.isArray(mdObj)) {
            await generateFile(mdObj, config);
        }
        else {
            const categories = mdObj.categories;
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
            let content = config.template;
            content = content.replace("{- html -}", mdObj.parseContent ? JSON.parse(mdObj.parseContent) : "");
            await (0, promises_1.writeFile)(path_1.default.join(dirPath, `${mdObj.title_en || mdObj.title}.${config.type}`), content, {
                encoding: "utf-8",
                flag: "w+",
            });
        }
    }
    return mdArr;
}
exports.generateFile = generateFile;
