"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleToc = void 0;
const tocList = {};
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
