import { Md, Config } from "type";
import translateFn from "@vitalets/google-translate-api";
import path from "path";
import { writeFileSync, readFileSync } from "fs";
import {
	readFile,
	writeFile,
	mkdir,
	stat,
	readdir,
	access,
	rm,
} from "fs/promises";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js"; // https://highlightjs.org/

const markdownIt: any = new MarkdownIt({
	typographer: true,
	linkify: true,
	langPrefix: "mdto-",
	xhtmlOut: true,
	highlight: function (str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(str, { language: lang }).value;
			} catch (__) {}
		}

		return ""; // use external default escaping
	},
});

export default class MarkdownTo {
	private template: string;
	public mds: Md[];
	private isTranslate: boolean = false;
	private outBaseDir: string;
	private outDir: string;
	private rootDir: string;
	private config: Config;
	constructor(rootDir: string, outDir: string, config: Config) {
		this.mds = [];
		this.isTranslate =
			config.isTranslate || process.argv.includes("--translate");
		this.rootDir = path.resolve(rootDir);
		this.template = readFileSync(
			path.resolve(`./preset/preset.${config.type}`),
			{
				encoding: "utf-8",
			}
		);
		this.outBaseDir = path.resolve(outDir);
		this.outDir = path.join(this.outBaseDir, config.type);
		this.config = config;
	}
	async render() {
		await this.check();
		await this.start();
	}
	check() {
		// 检查输出目录，如果输出目录不存在则创建
		rm(this.outBaseDir, { recursive: true, force: true })
			.then(
				() => access(this.outBaseDir),
				(err: Error) => {}
			)
			.catch(() => mkdir(this.outBaseDir))
			.then(() => access(this.outDir))
			.catch(() => mkdir(this.outDir));
	}

	start() {
		stat(this.rootDir)
			.then(
				(res: any) => {
					if (!res.isDirectory()) {
						throw new Error("rootDir不是一个目录");
					}
					return readdir(this.rootDir);
				},
				() => {
					console.error("rootDir根目录不存在或路径错误");
				}
			)
			.then((fileNames: string[] | void) => {
				if (!Array.isArray(fileNames) || fileNames?.length <= 0) {
					throw new Error("空目录");
				}
				console.time("解析文件信息");
				return this.parsePath(fileNames, this.rootDir);
			})
			.then((res: Md[]) => {
				console.timeEnd("解析文件信息");
				console.time("输出map.json");
				this.mds.push(...res);
				writeFileSync("./map.json", JSON.stringify(this.mds));
				console.timeEnd("输出map.json");
				return res;
			})
			.then((res: Md[]) => {
				console.time("解析Markdown");
				return this.parseMd(res);
			})
			.then((res: Md[]) => {
				console.timeEnd("解析Markdown");
				console.time("输出文件");
				return this.generateFile(res);
			})
			.then(() => {
				console.timeEnd("输出文件");
			})
			.catch((err: Error) => {
				console.error(err);
			});
	}

	async parsePath(files: string[], baseDir = this.rootDir) {
		const md: any = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const filePath = path.join(baseDir, file);
			if (this.config.ignores.includes(file)) {
				continue;
			}
			const fileStat = await stat(filePath);
			if (fileStat.isDirectory()) {
				const filePaths = await readdir(filePath);
				const parseResult: Md[] = await this.parsePath(
					filePaths,
					filePath
				);
				if (parseResult?.length > 0) md.push(parseResult);
			} else if (fileStat.isFile() && this.config.md.test(file)) {
				const o: Md = {
					path: filePath,
					categories: path
						.relative(this.rootDir, baseDir)
						.split(path.normalize("//")),
					title: path.basename(file).replace(path.extname(file), ""),
					createTime: fileStat.birthtime,
					updateTime: fileStat.mtime,
				};

				if (this.isTranslate === true) {
					if (!/^[a-zA-z0-9_\-]+$/.test(o.title)) {
						const title = o.title;
						let tran = await this.translate(o.title);
						o.title_en = tran?.replace(/\s/g, "_") || title;
					}
					for (let i = 0; i < o.categories.length; i++) {
						const category = o.categories[i];
						if (!/^[a-zA-z0-9_\-]+$/.test(category)) {
							let tran = await this.translate(category);
							o.categories[i] =
								tran?.replace(/\s/g, "_") || category;
						}
					}
				}
				md.push(o);
			}
		}
		return md;
	}

	async parseMd(mdArr: Md[]) {
		// 解析markdown
		for (let i = 0; i < mdArr.length; i++) {
			const mdObj = mdArr[i];
			if (Array.isArray(mdObj)) {
				await this.parseMd(mdObj);
			} else {
				const content = await readFile(mdObj.path, {
					encoding: "utf-8",
				});
				mdObj.parseContent = JSON.stringify(markdownIt.render(content));

				if (["tsx", "jsx"].includes(this.config.type)) {
					// jsx中转义{}，替换class
					mdObj.parseContent = mdObj.parseContent
						.replace(/\{/g, "&#123")
						.replace(/\}/g, "&#125")
						.replace(/class/g, "className");
				}
			}
		}
		return mdArr;
	}

	async generateFile(mdArr: Md[]) {
		for (let i = 0; i < mdArr.length; i++) {
			const mdObj = mdArr[i];
			if (Array.isArray(mdObj)) {
				await this.generateFile(mdObj);
			} else {
				const categories = mdObj.categories;
				// 创建目录
				let dirPath = path.resolve(this.outDir);
				for (let i = 0; i < categories.length; i++) {
					const category = categories[i];
					dirPath = path.join(dirPath, category);
					try {
						await access(dirPath);
					} catch {
						await mkdir(dirPath);
					}
				}
				let content = this.template;
				content = content.replace(
					"{- html -}",
					mdObj.parseContent ? JSON.parse(mdObj.parseContent) : ""
				);

				await writeFile(
					path.join(
						dirPath,
						`${mdObj.title_en || mdObj.title}.${this.config.type}`
					),
					content,
					{
						encoding: "utf-8",
						flag: "w+",
					}
				);
			}
		}
		return mdArr;
	}

	translate(q): Promise<string | void> | string {
		if (!q) {
			return "";
		}
		return translateFn(q, { to: "en" })
			.then((res) => {
				console.log(q + "  =>  " + res.text);
				return res.text;
			})
			.catch((err) => {
				console.error(q, "\n", err);
			});
	}
}
