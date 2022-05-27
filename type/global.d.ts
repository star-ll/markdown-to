declare interface Config {
	type?: Types;
	md?: RegExp;
	ignores?: string[];
	isTranslate?: boolean;
	translate?: (q: string) => Promise<string | void> | string;
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
