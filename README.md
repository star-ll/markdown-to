
# markdown-to

一个将markdown文件转换成vue、html、jsx、tsx格式文件的工具，支持批量转换与翻译。只需要指定根目录和输出目录。


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
const mdTo = new MarkdownTo(rootdir, outdir, {
	ignores: [".git"], // 忽略的目录
	type: "vue",  // vue / html / jsx / tsx
});

mdTo.render();  // 转换根目录下的所有markdown文件
mdTo.tocFile()  // 生成根据根目录markdown文件形成的目录
```

### Syntax highlighting

支持[highlight.js](https://highlightjs.org/)

### Nuxt、Next支持

文件转换支持`jsx`和`tsx`模式，只需要改变`options.type`

```javascript
const mdTo = new MarkdownTo(rootdir, outdir, {
	md: /\.md$/,
	ignores: [".git"], // 忽略的目录
	type: "tsx",  // vue / html / jsx / tsx
});
```

### Translate

在使用Next这类web框架时，会自动根据目录结构来生成路由，但是这类框架不支持中文名称的文件和目录，因此你可以在转换的时候启动翻译功能，来将目录和文件名翻译成对应的英文。

```shell
npm run start:translate
```

或者

```javascript
import { MarkdownTo } from "./index";
const options = {
	type: "html",
    isTranslate: true,
};
const mdTo = new MarkdownTo("/base", "./dist", options);
mdTo.render();
```

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

- [ ] 支持markdown toc

- [ ] 支持翻译markdown全文

- [ ] 支持nextjs快速建立博客

  

## Feedback

如果你在使用中发现任何bug，欢迎提交[issue](https://github.com/const-love-365-10000/markdown-to/issues)


## 🛠 Skills
Javascript, Typescript, Nodejs ...

