import path from "path";
import { writeFileSync, readFileSync, statSync, accessSync } from "fs";
import { mkdir, readdir, access, rm, writeFile, stat } from "fs/promises";
import { handleToc } from "./src/menu";
import { translate } from "./src/translate";
import { parseMd, markdownIt, parseDir } from "./src/parse";
import { generateFile } from "./src/file";
import { presetTemplate, presetHightLight } from "./src/presetList";
import { transformStyle, escapeHtml, transformJSXAttr } from "./src/util";
import tocPlugin from "markdown-it-toc-done-right";
import anchorPlugin from "markdown-it-anchor";

export class MarkdownTo {
	public mds: Md[] = [];
	private outDir: string;
	private rootDir: string;
	private config: Options;
	private translateDic;

	/**
	 *
	 * @param rootDir 根目录
	 * @param outDir 输出目录
	 * @param config 配置对象 {@link Config}
	 */
	constructor(rootDir: string, outDir: string, config: Config = {}) {
		try {
			accessSync(path.resolve("./cache"));
		} catch (__) {
			this.translateDic = {};
			mkdir(path.resolve("./cache/"));
		}
		try {
			const translateDictionary = readFileSync(
				path.resolve("./cache/translate.json"),
				{ encoding: "utf-8" }
			);
			this.translateDic = JSON.parse(translateDictionary);
		} catch (__) {
			//
		}
		const res = statSync(rootDir);
		try {
			if (!res?.isDirectory()) {
				console.error("rootDir不是一个目录");
			}
		} catch (err) {
			console.error("根目录路径不存在\n", err);
		}

		this.rootDir = path.resolve(rootDir);
		this.outDir = path.resolve(outDir);
		this.config = {
			md: config.md || /\.md$/,
			type: config.type || "vue",
			ignores: config.ignores || [],
			rootDir: this.rootDir || "./",
			outDir: this.outDir || "./dist",
			toc: config.toc || {},
			isTranslate:
				config.isTranslate ||
				process.argv.includes("--translate") ||
				false,
			translate:
				typeof config.translate === "function"
					? config.translate
					: translate,
			translateDic: this.translateDic || {},
			template: config.template,
		};

		if (!this.config.toc.containerClass) {
			this.config.toc.containerClass = "mdto-toc";
		}

		markdownIt.use(anchorPlugin, { tabIndex: false });
		markdownIt.use(tocPlugin, config.toc);

		this.mdRules();
	}
	public async render() {
		await this.regenerateDir(this.outDir);
		await this.start();
	}
	/**
	 * @function check 检查路径是否存在
	 * @param {string} path 文件或目录的绝对路径
	 * @return {boolean}  路径是否是文件
	 *   */
	private async checkPath(path: string): Promise<boolean | undefined | void> {
		const fileStat = await stat(path);
		if (fileStat.isFile()) {
			true;
		}
		if (fileStat.isDirectory()) {
			return false;
		}
	}

	private async regenerateDir(path: string) {
		try {
			await this.checkPath(path);
			await rm(path, { recursive: true });
		} catch (__) {
			//
		}

		await mkdir(path, { recursive: true });
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
			presetTemplate(list, { type: this.config.type }),
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
			markdownIt.renderer.rules.code_inline = function (
				tokens,
				idx,
				options,
				env,
				slf
			) {
				let attr = slf.renderAttrs(tokens[idx]);
				tokens[idx].content = `{\`${tokens[idx].content.replace(
					/`/g,
					"\\`"
				)}\`}`;
				attr = attr.replace(/class/g, "className");
				return "<code " + attr + ">" + tokens[idx].content + "</code>";
			};

			const fence = markdownIt.renderer.rules.fence;
			markdownIt.renderer.rules.fence = function (
				tokens,
				idx,
				options,
				env,
				slf
			) {
				tokens[idx].content = tokens[idx].content.replace(/`/g, "\\`");
				return fence(tokens, idx, options, env, slf)
					.replace(/\}/g, "&#125;")
					.replace(/\{/g, "&#123;")
					.replace(/class/g, "className")
					.replace(/\/\//g, "&#47;&#47;")
					.replace(/\/\*/g, "&#47;&#42;")
					.replace(/\*\//g, "$1&#42;&#47;")
					.replace(/'/g, "&quot;")
					.replace(/\n/g, "<br />");
			};
			/** 解析html属性 */
			markdownIt.renderer.renderAttrs = function renderAttrs(token) {
				let i, l, result;
				if (!token.attrs) {
					return "";
				}
				result = "";
				for (i = 0, l = token.attrs.length; i < l; i++) {
					let key = token.attrs[i][0];
					let value = token.attrs[i][1];

					if (key === "style") {
						/** JSX style对象 */
						value = JSON.stringify(
							transformStyle(escapeHtml(value))
						);
						result += " " + escapeHtml(key) + "=" + `{${value}}`;
						continue;
					}
					if (key === "class") {
						key = "className";
					}
					result +=
						" " +
						transformJSXAttr(escapeHtml(key), escapeHtml(value));
				}

				return result;
			};

			const tocOptions = this.config.toc;
			markdownIt.renderer.rules.tocOpen = function (
				tokens,
				idx /* , options, env, renderer */
			) {
				let _options = { ...tocOptions };
				if (tokens && idx >= 0) {
					const token = tokens[idx];
					_options = Object.assign(_options, token.inlineOptions);
				}
				const id = _options.containerId
					? ` id="${escapeHtml(_options.containerId)}"`
					: "";
				const containerHeaderHtml = _options.containerHeaderHtml || "";

				return `<nav${id} className="${escapeHtml(
					_options.containerClass
				)}">${containerHeaderHtml}`;
			};
			markdownIt.renderer.rules.tocClose = function () {
				const containerFooterHtml =
					tocOptions.containerFooterHtml || "";
				return `${containerFooterHtml}</nav>`;
			};
			// console.log(markdownIt.renderer.rules);
			// console.log(markdownIt.renderer.rules.tocClose.toString());
		}
	}
}
