import { MarkdownTo } from "./index";

const options: Config = {
	ignores: [".git", "面试经历"],
	type: "tsx",
	toc: true,
};
const mdTo = new MarkdownTo("/我的学习/my-knowledge-base", "./dist", options);

const argv = process.argv.slice(2);

if (argv.includes("--translate")) {
	options.isTranslate = true;
}

if (argv.includes("--toc-file")) {
	mdTo.tocFile();
}

mdTo.render();
