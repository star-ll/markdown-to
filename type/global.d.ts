declare type Toc = {
	/** @property 生成目录的标题等级,默认是1 */
	level?: number;
	/** @property 列表类型 ul 或 ol(默认) */
	listType?: "ul" | "ol";
	/** @property 识别toc的正则表达式字符串，
	 * 默认是 '(\\$\\{toc\\}|\\[\\[?_?toc_?\\]?\\]|\\$\\<toc(\\{[^}]*\\})\\>)' */
	placeholder?: string;
	/** @property 目录div的类名,默认mdto-toc */
	containerClass?: string;
	/** @property 目录div的ID,默认undefined */
	containerId?: string;
	/** @property 列表(ul/ol)的类名 */
	listClass?: string;
	/** @property 设置容器头部格式的HTML字符串 */
	containerHeaderHtml?: string;
	/** @property 设置容器底部格式的HTML字符串 */
	containerFooterHtml?: string;
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
	/** @property 实现toc文章目录,
	 * 将${toc} | [[toc]] | [toc] | [[_toc_]] 转成目录*/
	toc?: Toc;
	/** @property 自定义模板函数 */
	template?: (
		content: string,
		meta: {
			type: Types;
			title?: string;
		}
	) => string;
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
	template?: (
		content: string,
		meta: {
			type: Types;
		}
	) => string;
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
