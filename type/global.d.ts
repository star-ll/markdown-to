declare type Toc = {
	/** @property 生成目录的标题等级,默认是[1,2] */
	includeLevel?: number[];
	/** @property 目录div的类名,默认mdto-toc */
	containerClass?: string;
	/** @property 识别toc的正则表达式，默认是 /^\[\[toc\]\]/im */
	markerPattern?: RegExp;
	/** @property 列表类型 ul(默认) 或 ol */
	listType?: "ul" | "ol";
	/** @property 自定义标题格式的函数 */
	format?: (content: string) => string;
	/** @property 设置容器头部格式的HTML字符串 */
	containerHeaderHtml?: string;
	/** @property 设置容器底部格式的HTML字符串 */
	containerFooterHtml?: string;
	/** @property 自定义转换toc链接的函数 */
	transformLink?: (link: string) => string;
};

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
	toc?: Toc;
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
	toc: Toc;
}

declare interface Md {
	path: string;
	categories: string[];
	categories_en?: string[];
	title: string;
	title_en?: string;
	createTime: Date;
	updateTime: Date;
	parseContent?: string;
	toc?: string;
}

declare type Types = "vue" | "html" | "jsx" | "tsx";
