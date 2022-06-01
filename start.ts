import { MarkdownTo } from "./index";

const options: Config = {
	ignores: [".git"],
	type: "tsx",
	toc: {
		containerHeaderHtml: "<h2>目录</h2>",
		containerFooterHtml: "<hr />",
	},
};
const mdTo = new MarkdownTo("/我的学习/my-knowledge-base", "./dist", options);

const argv = process.argv.slice(2);

if (argv.includes("--translate")) {
	options.isTranslate = true;
}

if (argv.includes("--toc-file")) {
	mdTo.tocFile({ prefixUrl: "/articles/" });
}

mdTo.render();
