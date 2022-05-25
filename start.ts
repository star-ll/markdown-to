import { Config } from "type/index";
import { MarkdownTo } from "./index";

const options: Config = {
	ignores: [".git", "面试经历"],
	type: "html",
};
const mdTo = new MarkdownTo("/我的学习/my-knowledge-base", "./dist", options);

const argv = process.argv.slice(2);

if (argv.includes("--translate")) {
	options.isTranslate = true;
}

if (argv.includes("--toc-file")) {
	mdTo.tocFile();
} else {
	mdTo.render();
}
