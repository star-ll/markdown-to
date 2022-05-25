import { Md, Options } from "../type";
import path from "path";
import { writeFile, mkdir, access } from "fs/promises";

export async function generateFile(mdArr: Md[], config: Options) {
	for (let i = 0; i < mdArr.length; i++) {
		const mdObj = mdArr[i];
		if (Array.isArray(mdObj)) {
			await generateFile(mdObj, config);
		} else {
			const categories = mdObj.categories;
			// 创建目录
			let dirPath = path.resolve(config.outDir);
			for (let i = 0; i < categories.length; i++) {
				const category = categories[i];
				dirPath = path.join(dirPath, category);
				try {
					await access(dirPath);
				} catch {
					await mkdir(dirPath);
				}
			}
			let content = config.template;
			content = content.replace(
				"{- html -}",
				mdObj.parseContent ? JSON.parse(mdObj.parseContent) : ""
			);

			await writeFile(
				path.join(
					dirPath,
					`${mdObj.title_en || mdObj.title}.${config.type}`
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
