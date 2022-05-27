import path from "path";
import { writeFileSync, readFileSync, statSync } from "fs";
import { mkdir, readdir, access, rm, writeFile } from "fs/promises";
import jsx from "markdown-it-jsx";
import { createMdToc, handleToc } from "./src/menu";
import { translate } from "./src/translate";
import { parseMd, markdownIt, parseDir } from "./src/parse";
import { generateFile } from "./src/file";
import { presetTemplate } from "./src/presetList";
import translateDic from "./cache/translate.json";

export class MarkdownTo {
	public mds: Md[] = [];
	private outBaseDir: string;
	private outDir: string;
	private rootDir: string;
	private config: Options;
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
			translateDic: translateDic,
		};

		if (["tsx", "jsx"].includes(this.config.type)) {
			markdownIt.use(jsx);
		}
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

	private handleToc = handleToc;
	public async tocFile() {
		if (!this.mds || this.mds?.length === 0) {
			const fileNames = await readdir(this.rootDir);
			if (!Array.isArray(fileNames) || fileNames?.length <= 0) {
				throw new Error("空目录");
			}
			this.mds = await this.parseDir(
				fileNames,
				this.rootDir,
				this.config
			);
		}
		const tocList = await this.handleToc(this.mds);
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
		const mds = await this.parseDir(fileNames, this.rootDir, this.config);
		console.timeEnd("解析文件信息");

		console.time("输出map.json");
		this.mds.push(...mds);
		writeFileSync("./map.json", JSON.stringify(this.mds));
		console.timeEnd("输出map.json");

		console.time("解析Markdown");
		await this.parseMd(mds, this.config);
		console.timeEnd("解析Markdown");

		// 将翻译的字段缓存
		if (this.config.isTranslate) {
			writeFile(
				path.resolve("./cache/translate.json"),
				JSON.stringify(this.config.translateDic),
				{
					flag: "w+",
					encoding: "utf-8",
				}
			);
		}

		// toc目录
		if (this.config.toc) await createMdToc(mds);

		console.time("输出文件");
		await this.generateFile(mds, this.config);
		console.timeEnd("输出文件");
	}

	/**
	 *  根据rootDir递归地读取markdown文件，将文件目录等信息转换成特定的对象结构Mds
	 *
	 * */
	private parseDir = parseDir;

	/** 在Md对象基础上递归读取markdown内容并转换成html*/
	private parseMd = parseMd;

	/** 将Mds按照原目录结构生成目标文件*/
	private generateFile = generateFile;
}
