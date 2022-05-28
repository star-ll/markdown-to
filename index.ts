import path from "path";
import { writeFileSync, readFileSync, statSync } from "fs";
import { mkdir, readdir, access, rm, writeFile } from "fs/promises";
import jsx from "markdown-it-jsx";
import { createMdToc, handleToc } from "./src/menu";
import { translate } from "./src/translate";
import { parseMd, markdownIt, parseDir } from "./src/parse";
import { generateFile } from "./src/file";
import { presetTemplate, presetHightLight } from "./src/presetList";
import { transformStyle } from "./src/util";

let translateDic;
try {
	const translateDictionary = readFileSync(
		path.resolve("./cache/translate.json"),
		{ encoding: "utf-8" }
	);
	translateDic = JSON.parse(translateDictionary);
} catch (__) {
	translateDic = {};
}

export class MarkdownTo {
	public mds: Md[] = [];
	private outBaseDir: string;
	private outDir: string;
	private rootDir: string;
	private config: Options;

	/**
	 *
	 * @param rootDir 根目录
	 * @param outDir 输出目录
	 * @param config 配置对象 {@link Config}
	 */
	constructor(rootDir: string, outDir: string, config: Config = {}) {
		const res = statSync(rootDir);
		try {
			if (!res?.isDirectory()) {
				console.error("rootDir不是一个目录");
			}
		} catch (err) {
			console.error("根目录路径不存在\n", err);
		}

		this.rootDir = path.resolve(rootDir);
		this.outBaseDir = path.resolve(outDir);
		this.outDir = path.join(this.outBaseDir, config.type || "vue");
		this.config = {
			md: config.md || /\.md$/,
			type: config.type || "vue",
			ignores: config.ignores || [],
			rootDir: this.rootDir || "./",
			outDir: this.outDir || "./dist",
			toc: config.toc || false,
			isTranslate:
				config.isTranslate ||
				process.argv.includes("--translate") ||
				false,
			translate:
				typeof config.translate === "function"
					? config.translate
					: translate,
			translateDic: translateDic || {},
		};

		this.mdRules();
	}
	public async render() {
		await this.check();
		await this.start();
	}
	private check() {
		// 检查输出目录，如果输出目录不存在则创建
		rm(this.outBaseDir, { recursive: true, force: true })
			.then(() => access(this.outBaseDir))
			.catch(() => mkdir(this.outBaseDir))
			.then(() => access(this.outDir))
			.catch(() => mkdir(this.outDir));
	}

	/**
	 *
	 * @param options  配置文件
	 */
	public async tocFile(options: { prefixUrl?: string } = {}) {
		if (!this.mds || this.mds?.length === 0) {
			const fileNames = await readdir(this.rootDir);
			if (!Array.isArray(fileNames) || fileNames?.length <= 0) {
				throw new Error("空目录");
			}
			this.mds = await parseDir(fileNames, this.rootDir, this.config);
		}
		const tocList = await handleToc(this.mds, options);
		let list = "";
		for (const t of Object.values(tocList)) {
			list += t + "\n";
		}
		list = markdownIt.render(list);
		writeFileSync(
			`./dist/toc.${this.config.type}`,
			presetTemplate(list, this.config.type),
			{
				flag: "w+",
				encoding: "utf-8",
			}
		);
	}

	private async start() {
		const fileNames = await readdir(this.rootDir);
		if (!Array.isArray(fileNames) || fileNames?.length <= 0) {
			throw new Error("空目录");
		}
		console.time("解析文件信息");
		const mds = await parseDir(fileNames, this.rootDir, this.config);
		console.timeEnd("解析文件信息");

		console.time("输出mds.json");
		this.mds.push(...mds);
		writeFileSync(
			path.resolve("./cache/mds.json"),
			JSON.stringify(this.mds)
		);
		console.timeEnd("输出mds.json");

		console.time("解析Markdown");
		await parseMd(mds, this.config);
		console.timeEnd("解析Markdown");

		// 将翻译的字段缓存
		if (this.config.isTranslate) {
			writeFile(
				path.resolve("./cache/translate.json"),
				JSON.stringify(this.config.translateDic || {}),
				{
					flag: "w+",
					encoding: "utf-8",
				}
			);
		}

		// toc目录
		if (this.config.toc) await createMdToc(mds);

		console.time("输出文件");
		await generateFile(mds, this.config);
		console.timeEnd("输出文件");
	}

	/**
	 * @function 处理markdown解析规则
	 */
	private mdRules() {
		// 代码高亮
		markdownIt.set({ highlight: presetHightLight(this.config.type) });

		// 转换规则
		if (["tsx", "jsx"].includes(this.config.type)) {
			const isJSX = ["tsx", "jsx"].includes(this.config.type);
			// markdownIt.renderer.rules.code_block = function (
			// 	tokens,
			// 	idx,
			// 	option,
			// 	env,
			// 	slf
			// ) {
			// 	const token = tokens[idx];
			// 	let content = escapeHtml(tokens[idx].content);
			// 	let attr = slf.renderAttrs(token);
			// 	if (isJSX) {
			// 		content = `{\`${content}\`}`;
			// 		attr = attr
			// 			.replace(/class/g, "className")
			// 			.replace(/style=(['"]).*?\1/g, "");
			// 	}
			// 	return "<pre" + attr + "><code>" + content + "</code></pre>\n";
			// };
			markdownIt.renderer.rules.code_inline = function (
				tokens,
				idx,
				options,
				env,
				slf
			) {
				const token = tokens[idx];
				let attr = slf.renderAttrs(token);
				if (isJSX) {
					tokens[idx].content = `{\`${tokens[idx].content.replace(
						/`/g,
						"\\`"
					)}\`}`;
					attr = attr
						.replace(/class/g, "className")
						.replace(/style=(['"])(.*?)\1/g, (match) =>
							transformStyle(match.slice(7, -1))
						);
				}
				return "<code" + attr + ">" + tokens[idx].content + "</code>";
			};

			const fence = markdownIt.renderer.rules.fence;
			markdownIt.renderer.rules.fence = function escape_renderer(
				tokens,
				idx,
				options,
				env,
				slf
			) {
				if (isJSX) {
					const content = tokens[idx].content;

					tokens[idx].content =
						"{`" + content.replace(/`/g, "\\`") + "`}";

					return fence(tokens, idx, options, env, slf)
						.replace(/class="/g, 'className="')
						.replace(/style=(['"])(.*?)\1/g, (match) =>
							transformStyle(match.slice(7, -1))
						);
				}

				return fence(tokens, idx, options, env, slf);
			};
			console.log(markdownIt.renderer.rules);
		}
	}
}
