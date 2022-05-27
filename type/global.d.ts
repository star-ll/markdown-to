declare interface Config {
	/** @property
	 * { html | vue | jsx | tsx }
	 * 转换的目标文件类型
	 * */
	type?: Types;
	/** @property 匹配markdown的正则表达式 */
	md?: RegExp;
	/** @property 忽略的文件或目录  */
	ignores?: string[];
	/** @property 是否翻译名称与目录  */
	isTranslate?: boolean;
	/** @property  自定义翻译函数*/
	translate?: (q: string) => Promise<string | void> | string;
	/** @property 实现toc文章目录*/
	toc?: string[] | boolean;
}

declare interface Options {
	rootDir: string;
	outDir: string;
	type: Types;
	md: RegExp;
	ignores: string[];
	isTranslate: boolean;
	translate: (q: string) => Promise<string | void> | string;
	/** 翻译字典(缓存)*/
	translateDic: object;
	toc: string[] | boolean;
}

declare interface Md {
	path: string;
	categories: string[];
	title: string;
	title_en?: string;
	createTime: Date;
	updateTime: Date;
	parseContent?: string;
	toc?: string;
}

declare type Types = "vue" | "html" | "jsx" | "tsx";
