
# markdown-to

一个将markdown文件转换成vue、html、jsx、tsx格式文件的工具，支持批量转换与翻译。




## Installation

Install markdown-to with npm or yarn

```bash
  npm install -D markdown-to
  yarn add -D markdown-to
```
    
## Usage

作为npm package时：
```javascript
import MarkdownTo from "markdown-to";
const rootdir = "../文章/" // 指定文章所在的根目录
const outdir = "./dist/"  // 指定输出目录
const mdTo = new MarkdownTo(rootdir, outdir, {
	md: /\.md$/,
	ignores: [".git"], // 忽略的目录
	type: "tsx",  // vue / html / jsx / tsx
});

mdTo.render();
```

git clone时：
```shell
git clone git@github.com:const-love-365-10000/markdown-to.git
cd markdown-to
npm run start  // 执行转换
npm run start:translate  // 执行转换并将文件名和目录翻译成英文
```

## Feedback

如果你在使用中发现任何bug，欢迎提交[issue](https://github.com/const-love-365-10000/markdown-to/issues)


## 🛠 Skills
Javascript, Typescript, Nodejs ...

