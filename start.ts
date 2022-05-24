import MarkdownTo from "./index";

const mdTo = new MarkdownTo("/我的学习/my-knowledge-base", "./dist", {
	md: /\.md$/,
	ignores: [".git", "面试经历"],
	type: "tsx",
});

mdTo.render();
