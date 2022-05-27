"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMdToc = exports.handleToc = void 0;
const parse_1 = require("./parse");
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
            let allCategory = "/";
            for (let j = 0; j < md.categories.length; j++) {
                const category = md.categories[j];
                allCategory += category + "/";
                if (!tocList[allCategory]) {
                    tocList[allCategory] = li + category;
                }
                li = "\t" + li;
            }
            const title = md.title_en || md.title;
            tocList[allCategory + title] =
                li +
                    `[${title}](${allCategory + title.replace(/\s/g, "_") + "/"})`;
        }
    }
    return tocList;
}
exports.handleToc = handleToc;
// 为所有输出文件生成toc目录
const hRegexp = /<h[1-6].+?>/g;
function createMdToc(mds) {
    for (let i = 0; i < mds.length; i++) {
        const md = mds[i];
        if (Array.isArray(md)) {
            createMdToc(md);
        }
        else {
            md.toc = resolveHead(md);
        }
    }
}
exports.createMdToc = createMdToc;
function resolveHead(md) {
    try {
        if (!md?.parseContent) {
            return ""; // 解析Markdown失败
        }
        const heads = md.parseContent.match(hRegexp);
        if (!heads)
            return ""; // 没有发现任何标题
        const headLevel = heads.map((item) => Number(item.match(/<h[1-6]>/g)?.[0].slice(2, 3) || "0"));
        const titles = heads.map((item) => item.match(/>.+</g)?.[0].slice(1, -1));
        let html = "";
        headLevel.forEach((item, index) => {
            let li = "- ";
            for (let i = 1; i < item; i++) {
                li = "\t" + li;
            }
            li += titles[index];
            html = html + li + "\n";
        });
        return parse_1.markdownIt.render(html);
    }
    catch (err) {
        console.error(`[${md.title}] toc生成失败`);
        console.log(err);
    }
}
