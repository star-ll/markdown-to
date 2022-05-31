"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleToc = void 0;
const tocList = {};
// 生成目录文件
function handleToc(mds, options = {}) {
    const { prefixUrl = "" } = options;
    for (let i = 0; i < mds.length; i++) {
        const md = mds[i];
        if (Array.isArray(md)) {
            handleToc(md, options);
        }
        else {
            let li = "- ";
            let allCategory = "/";
            const categories = md.categories_en || md.categories;
            console.log(li, " ", categories, " ");
            for (let j = 0; j < categories.length; j++) {
                const category = categories[j];
                if (!category) {
                    break;
                }
                allCategory += category + "/";
                if (!tocList[allCategory]) {
                    tocList[allCategory] = li + (md.categories[j] || category);
                }
                li = "\t" + li;
            }
            const title = md.title_en || md.title;
            tocList[allCategory + title] =
                li +
                    `[${md.title}](${prefixUrl + allCategory + title.replace(/\s/g, "_") + "/"})`;
        }
    }
    return tocList;
}
exports.handleToc = handleToc;
