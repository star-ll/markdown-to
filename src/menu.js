"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMdToc = exports.handleToc = void 0;
const tocList = {};
// 生成目录文件
function handleToc(mds) {
    for (let i = 0; i < mds.length; i++) {
        const md = mds[i];
        if (Array.isArray(md)) {
            handleToc(md);
        }
        else {
            let li = "- ";
            let allCategory = "";
            for (let j = 0; j < md.categories.length; j++) {
                const category = md.categories[j];
                allCategory += category;
                if (!tocList[allCategory]) {
                    tocList[allCategory] = li + category;
                }
                li = "\t" + li;
            }
            tocList[allCategory + md.title] = li + md.title;
        }
    }
    return tocList;
}
exports.handleToc = handleToc;
// 为所有输出文件生成toc目录
function createMdToc(mds) {
    console.log(mds);
}
exports.createMdToc = createMdToc;
