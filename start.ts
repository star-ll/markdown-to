import { MarkdownTo } from "./index";

const options: Config = {
	ignores: [".git"],
	type: "tsx",
	toc: true,
};
const mdTo = new MarkdownTo("", "./dist", options);

const argv = process.argv.slice(2);

if (argv.includes("--translate")) {
	options.isTranslate = true;
}

if (argv.includes("--toc-file")) {
	mdTo.tocFile({ prefixUrl: "/articles/" });
}

mdTo.render();
