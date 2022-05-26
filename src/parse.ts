import { readFile, stat, readdir } from "fs/promises";
import path from "path";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js"; // https://highlightjs.org/

export const markdownIt: any = new MarkdownIt({
	typographer: true,
	linkify: true,
	langPrefix: "mdto-",
	xhtmlOut: true,
	highlight: function (str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(str, { language: lang }).value;
			} catch (__) {
				//
			}
		}

		return ""; // use external default escaping
	},
});

// 解析rootDir，生成mds
export async function parseDir(files: string[], baseDir, config: Options) {
	const md: any[] = [];
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const filePath = path.join(baseDir, file);
		if (Array.isArray(config.ignores) && config.ignores.includes(file)) {
			continue;
		}
		const fileStat = await stat(filePath);
		if (fileStat.isDirectory()) {
			const filePaths = await readdir(filePath);
			const parseResult: Md[] = await parseDir(
				filePaths,
				filePath,
				config
			);
			if (parseResult?.length > 0) md.push(parseResult);
		} else if (fileStat.isFile() && config.md?.test(file)) {
			const o: Md = {
				path: filePath,
				categories: path
					.relative(config.rootDir, baseDir)
					.split(path.normalize("//")),
				title: path.basename(file).replace(path.extname(file), ""),
				createTime: fileStat.birthtime,
				updateTime: fileStat.mtime,
			};

			if (config.isTranslate === true) {
				if (!/^[a-zA-z0-9_-]+$/.test(o.title)) {
					const title = o.title;
					const tran = await config.translate?.(o.title);
					o.title_en = tran?.replace(/\s/g, "_") || title;
				}
				for (let i = 0; i < o.categories.length; i++) {
					const category = o.categories[i];
					if (!/^[a-zA-z0-9_-]+$/.test(category)) {
						const tran = await config.translate?.(category);
						o.categories[i] = tran?.replace(/\s/g, "_") || category;
					}
				}
			}
			md.push(o);
		}
	}
	return md;
}

export async function parseMd(mdArr: Md[], config: Options) {
	// 解析markdown
	for (let i = 0; i < mdArr.length; i++) {
		const mdObj = mdArr[i];
		if (Array.isArray(mdObj)) {
			await parseMd(mdObj, config);
		} else {
			const content = await readFile(mdObj.path, {
				encoding: "utf-8",
			});
			mdObj.parseContent = JSON.stringify(markdownIt.render(content));

			if (["tsx", "jsx"].includes(config.type)) {
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
