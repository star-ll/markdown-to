import { readFile, stat, readdir } from "fs/promises";
import path from "path";
import MarkdownIt from "markdown-it";
import { chineseRegex, chineseRegexAll } from "./util";

export const markdownIt: any = new MarkdownIt({
	typographer: true,
	linkify: true,
	langPrefix: "mdto-",
	xhtmlOut: true,
});

/**
 *  根据rootDir递归地读取markdown文件，将文件目录等信息转换成特定的对象结构Mds
 * */
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
				if (typeof config.translate !== "function") {
					throw new Error("translate不是一个函数");
				}
				const translateDic = config.translateDic || {};
				/** 翻译文件名*/
				if (chineseRegex.test(o.title)) {
					const title = o.title;
					const tran =
						translateDic[title] ||
						(await config.translate?.(o.title));
					o.title_en =
						tran
							?.replace(/\s/g, "_")
							.replace(chineseRegexAll, "_") || title;
					!translateDic[title] && (translateDic[title] = tran);
				}
				/** 翻译目录*/
				if (!Array.isArray(o.categories_en)) {
					o.categories_en = [];
				}
				for (let i = 0; i < o.categories.length; i++) {
					const category = o.categories[i];
					if (chineseRegex.test(category)) {
						const tran =
							translateDic[category] ||
							(await config.translate?.(category));
						o.categories_en[i] =
							tran
								?.replace(/\s/g, "_")
								.replace(chineseRegexAll, "_") || category;
						!translateDic[category] &&
							(translateDic[category] = tran);
					} else {
						o.categories_en[i] = o.categories[i];
					}
				}
			}
			md.push(o);
		}
	}
	return md;
}

/** 在Md对象基础上递归读取markdown内容并转换成html*/
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
			mdObj.parseContent = markdownIt
				.render(content)
				.replace(/\u200B/g, "")
				.replace(/\u00a0/g, "");
		}
	}
	return mdArr;
}
