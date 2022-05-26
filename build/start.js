"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const options = {
    ignores: [".git", "面试经历"],
    type: "html",
    toc: true,
};
const mdTo = new index_1.MarkdownTo("/我的学习/my-knowledge-base", "./dist", options);
const argv = process.argv.slice(2);
if (argv.includes("--translate")) {
    options.isTranslate = true;
}
if (argv.includes("--toc-file")) {
    mdTo.tocFile();
}
else {
    mdTo.render();
}
