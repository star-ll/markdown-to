export interface Config {
	type: Types;
	md?: RegExp;
	ignores?: string[];
	isTranslate?: boolean;
}

export interface Md {
	path: string;
	categories: string[];
	title: string;
	title_en?: string;
	createTime: Date;
	updateTime: Date;
	parseContent?: string;
}

declare type Types = "vue" | "html" | "jsx" | "tsx";
