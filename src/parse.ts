import { readFile, stat, readdir } from "fs/promises";
import path from "path";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js"; // https://highlightjs.org/

// eslint-disable-next-line no-irregular-whitespace
const HTML_ESCAPE_TEST_RE = /[&<>"{}]/;
// eslint-disable-next-line no-irregular-whitespace
const HTML_ESCAPE_REPLACE_RE = /[&<>"{}]/g;
const HTML_REPLACEMENTS = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"{": "&#123",
	"}": "&#125",
};
function replaceUnsafeChar(ch) {
	return HTML_REPLACEMENTS[ch];
}
function escapeHtml(str) {
	if (HTML_ESCAPE_TEST_RE.test(str)) {
		return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
	}
	return str;
}

export const markdownIt: any = new MarkdownIt({
	typographer: true,
	linkify: true,
	langPrefix: "mdto-",
	xhtmlOut: true,
	highlight: function (str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return (
					'<pre class="hljs"><code>' +
					hljs.highlight(escapeHtml(str), {
						language: lang,
						ignoreIllegals: true,
					}).value +
					"</code></pre>"
				);
			} catch (__) {
				console.error("highlight error " + str);

				//
			}
		}

		return '<pre class="hljs"><code>' + escapeHtml(str) + "</code></pre>"; // use external default escaping
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
				if (typeof config.translate !== "function") {
					throw new Error("translate不是一个函数");
				}
				const translateDic = config.translateDic || {};
				/** 翻译文件名*/
				if (!/^[a-zA-z0-9_-]+$/.test(o.title)) {
					const title = o.title;
					const tran =
						translateDic[title] ||
						(await config.translate?.(o.title));
					o.title_en = tran?.replace(/\s/g, "_") || title;
					!translateDic[title] && (translateDic[title] = tran);
				}
				/** 翻译目录*/
				for (let i = 0; i < o.categories.length; i++) {
					const category = o.categories[i];
					if (!/^[a-zA-z0-9_-]+$/.test(category)) {
						const tran =
							translateDic[category] ||
							(await config.translate?.(category));
						o.categories[i] = tran?.replace(/\s/g, "_") || category;
						!translateDic[category] &&
							(translateDic[category] = tran);
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
			mdObj.parseContent = markdownIt
				.render(content)
				.replace(/\u200B/g, "")
				.replace(/\u00a0/g, "");
		}
	}
	return mdArr;
}
