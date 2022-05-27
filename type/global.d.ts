declare interface Config {
	/**
	 * 转换文件类型
	 * html | vue | jsx | tsx
	 * */
	type?: Types;
	/**匹配markdown的正则表达式 */
	md?: RegExp;
	/**忽略的文件或目录  */
	ignores?: string[];
	/**是否翻译名称与目录  */
	isTranslate?: boolean;
	/** 自定义翻译函数*/
	translate?: (q: string) => Promise<string | void> | string;
	/** 实现toc文章目录*/
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
