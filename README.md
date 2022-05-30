
# markdown-to

指定一个根目录，将目录中所有markdown文件转换成对应的html、vue、jsx、tsx类型文件，支持代码高亮、目录等功能。


## Installation

使用npm或yarn安装

```bash
  npm install -D markdown-to
  yarn add -D markdown-to
```

也可以将项目拷贝到本地使用

```shell
git clone git@github.com:const-love-365-10000/markdown-to.git
cd markdown-to
```



## CLI

```shell
npm run start  // 执行转换
npm run start:translate  // 执行转换并将文件名和目录翻译成英文
npm run start:tocFile // 生成目录文件
```



## Usage

```javascript
import { MarkdownTo } from "markdown-to";  // ES6
// const { MarkdownTo } = require("markdown-to");  // Commonjs
const rootdir = "../文章/" // 指定文章所在的根目录,会递归读取目录及其子目录下的所有markdown文件
const outdir = "./dist/"  // 指定输出目录，按照原目录结构生成文件
const mdTo = new MarkdownTo(rootdir, outdir);

mdTo.render();  // 转换根目录下的所有markdown文件
mdTo.tocFile()  // 生成根据根目录markdown文件形成的目录
```

### Config

`MarkdownTo`实例化时接收三个参数，分别是根目录`rootdir`、输入目录`outdir`，以及配置对象`config`。配置对象`config`可选，所有选项如下：

```typescript
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
	/** @property 实现toc文章目录的文件，boolean类型表示全部都生成toc目录或都不生成*/
	toc?: string[] | boolean;
}
```



## Document

### Syntax highlighting

markdown-to在转换时添加了代码高亮支持，但你需要在项目中额外引入[highlight.js](https://highlightjs.org/)才能生效。

```shell
// 安装highlight.js
npm install highlight.js -S
```

```javascript
// 项目中引入css文件
import "highlight.js/styles/atom-one-dark.css"; // 使用atom-one-dark风格的代码高亮
```

[highlight.js](https://highlightjs.org/)支持多种语言和主体风格，要使用其他风格只需要切换引入的css文件即可。

更多信息请见 [highlight.js](https://highlightjs.org/)

### Nuxt、Next支持

文件转换支持`jsx`和`tsx`模式，只需要改变`options.type`

```javascript
const mdTo = new MarkdownTo(rootdir, outdir, {
	type: "tsx",  // vue / html / jsx / tsx
});
```

### Translate

在使用Next这类web框架时，会自动根据目录结构来生成路由，但是这类框架不支持中文名称的文件和目录，因此你可以在转换的时候启动翻译功能，来将目录和文件名翻译成对应的英文。

```javascript
const options = {
	type: "tsx",
    isTranslate: true,
};
const mdTo = new MarkdownTo("/base", "./dist", options);
mdTo.render();
```

> 注意： 翻译API默认使用的是google-translate，请确保你的网络能访问，如果无法使用，请切换成其他翻译API。

markdown-to翻译默认使用谷歌翻译API，你可以切换成其他API，例如百度翻译，只需要将`config.translate`指定一个实现翻译的函数即可。

```typescript
const options = {
    isTranslate: true,
    transalte: translateMarkdown
};
function translateMarkdown(q: string):Promise<string | void> | string {
    /*
    * q 是要翻译的文本
    */
}
```

为了节省翻译时间，markdown-to会将翻译结果保存在`./cache/translate.json`中，下次再进行翻译时会直接使用该文件，你可以修改该文件来更正翻译结果。

### toc-file

有时你可能需要一个包含所有文章的目录界面，你可以使用

```shell
npm run start:tocFile
```

或者

```javascript
mdTo.render();
```



## Feature

- [x] 支持翻译文件名和目录功能，以便能够运用到nextjs此类框架中

- [x] 支持生成文件目录

- [x] 支持markdown toc

- [ ] 支持翻译markdown全文

- [ ] 支持nextjs快速建立博客

  

## Feedback

如果你在使用中发现任何bug，欢迎提交[issue](https://github.com/const-love-365-10000/markdown-to/issues)


## 🛠 Skills
Javascript, Typescript, Nodejs ...

