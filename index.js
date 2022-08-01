"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.MarkdownTo = void 0;
var path_1 = require("path");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var menu_1 = require("./src/menu");
var translate_1 = require("./src/translate");
var parse_1 = require("./src/parse");
var file_1 = require("./src/file");
var presetList_1 = require("./src/presetList");
var util_1 = require("./src/util");
var markdown_it_toc_done_right_1 = require("markdown-it-toc-done-right");
var markdown_it_anchor_1 = require("markdown-it-anchor");
var MarkdownTo = /** @class */ (function () {
    /**
     *
     * @param rootDir 根目录
     * @param outDir 输出目录
     * @param config 配置对象 {@link Config}
     */
    function MarkdownTo(rootDir, outDir, config) {
        if (config === void 0) { config = {}; }
        this.mds = [];
        try {
            (0, fs_1.accessSync)(path_1["default"].resolve("./cache"));
        }
        catch (__) {
            this.translateDic = {};
            (0, promises_1.mkdir)(path_1["default"].resolve("./cache/"));
        }
        try {
            var translateDictionary = (0, fs_1.readFileSync)(path_1["default"].resolve("./cache/translate.json"), { encoding: "utf-8" });
            this.translateDic = JSON.parse(translateDictionary);
        }
        catch (__) {
            //
        }
        var res = (0, fs_1.statSync)(rootDir);
        try {
            if (!(res === null || res === void 0 ? void 0 : res.isDirectory())) {
                console.error("rootDir不是一个目录");
            }
        }
        catch (err) {
            console.error("根目录路径不存在\n", err);
        }
        this.rootDir = path_1["default"].resolve(rootDir);
        this.outBaseDir = path_1["default"].resolve(outDir);
        this.outDir = this.outBaseDir;
        this.config = {
            md: config.md || /\.md$/,
            type: config.type || "vue",
            ignores: config.ignores || [],
            rootDir: this.rootDir || "./",
            outDir: this.outDir || "./dist",
            toc: config.toc || {},
            isTranslate: config.isTranslate ||
                process.argv.includes("--translate") ||
                false,
            translate: typeof config.translate === "function"
                ? config.translate
                : translate_1.translate,
            translateDic: this.translateDic || {},
            template: config.template
        };
        if (!this.config.toc.containerClass) {
            this.config.toc.containerClass = "mdto-toc";
        }
        parse_1.markdownIt.use(markdown_it_anchor_1["default"], { tabIndex: false });
        parse_1.markdownIt.use(markdown_it_toc_done_right_1["default"], config.toc);
        this.mdRules();
    }
    MarkdownTo.prototype.render = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.check()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.start()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MarkdownTo.prototype.check = function () {
        var _this = this;
        // 检查输出目录，如果输出目录不存在则创建
        (0, promises_1.rm)(this.outBaseDir, { recursive: true, force: true })
            .then(function () { return (0, promises_1.access)(_this.outBaseDir); })["catch"](function () { return (0, promises_1.mkdir)(_this.outBaseDir); })
            .then(function () { return (0, promises_1.access)(_this.outDir); })["catch"](function () { return (0, promises_1.mkdir)(_this.outDir); });
    };
    /**
     *
     * @param options  配置文件
     */
    MarkdownTo.prototype.tocFile = function (options) {
        var _a;
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var fileNames, _b, tocList, list, _i, _c, t;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!(!this.mds || ((_a = this.mds) === null || _a === void 0 ? void 0 : _a.length) === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, promises_1.readdir)(this.rootDir)];
                    case 1:
                        fileNames = _d.sent();
                        if (!Array.isArray(fileNames) || (fileNames === null || fileNames === void 0 ? void 0 : fileNames.length) <= 0) {
                            throw new Error("空目录");
                        }
                        _b = this;
                        return [4 /*yield*/, (0, parse_1.parseDir)(fileNames, this.rootDir, this.config)];
                    case 2:
                        _b.mds = _d.sent();
                        _d.label = 3;
                    case 3: return [4 /*yield*/, (0, menu_1.handleToc)(this.mds, options)];
                    case 4:
                        tocList = _d.sent();
                        list = "";
                        for (_i = 0, _c = Object.values(tocList); _i < _c.length; _i++) {
                            t = _c[_i];
                            list += t + "\n";
                        }
                        list = parse_1.markdownIt.render(list);
                        (0, fs_1.writeFileSync)("./dist/toc.".concat(this.config.type), (0, presetList_1.presetTemplate)(list, { type: this.config.type }), {
                            flag: "w+",
                            encoding: "utf-8"
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    MarkdownTo.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fileNames, mds;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, promises_1.readdir)(this.rootDir)];
                    case 1:
                        fileNames = _b.sent();
                        if (!Array.isArray(fileNames) || (fileNames === null || fileNames === void 0 ? void 0 : fileNames.length) <= 0) {
                            throw new Error("空目录");
                        }
                        console.time("解析文件信息");
                        return [4 /*yield*/, (0, parse_1.parseDir)(fileNames, this.rootDir, this.config)];
                    case 2:
                        mds = _b.sent();
                        console.timeEnd("解析文件信息");
                        console.time("输出mds.json");
                        (_a = this.mds).push.apply(_a, mds);
                        (0, fs_1.writeFileSync)(path_1["default"].resolve("./cache/mds.json"), JSON.stringify(this.mds));
                        console.timeEnd("输出mds.json");
                        console.time("解析Markdown");
                        return [4 /*yield*/, (0, parse_1.parseMd)(mds, this.config)];
                    case 3:
                        _b.sent();
                        console.timeEnd("解析Markdown");
                        // 将翻译的字段缓存
                        if (this.config.isTranslate) {
                            (0, promises_1.writeFile)(path_1["default"].resolve("./cache/translate.json"), JSON.stringify(this.config.translateDic || {}), {
                                flag: "w+",
                                encoding: "utf-8"
                            });
                        }
                        console.time("输出文件");
                        return [4 /*yield*/, (0, file_1.generateFile)(mds, this.config)];
                    case 4:
                        _b.sent();
                        console.timeEnd("输出文件");
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @function 处理markdown解析规则
     */
    MarkdownTo.prototype.mdRules = function () {
        // 代码高亮
        parse_1.markdownIt.set({ highlight: (0, presetList_1.presetHightLight)(this.config.type) });
        // 转换规则
        if (["tsx", "jsx"].includes(this.config.type)) {
            parse_1.markdownIt.renderer.rules.code_inline = function (tokens, idx, options, env, slf) {
                var attr = slf.renderAttrs(tokens[idx]);
                tokens[idx].content = "{`".concat(tokens[idx].content.replace(/`/g, "\\`"), "`}");
                attr = attr.replace(/class/g, "className");
                return "<code " + attr + ">" + tokens[idx].content + "</code>";
            };
            var fence_1 = parse_1.markdownIt.renderer.rules.fence;
            parse_1.markdownIt.renderer.rules.fence = function (tokens, idx, options, env, slf) {
                tokens[idx].content = tokens[idx].content.replace(/`/g, "\\`");
                return fence_1(tokens, idx, options, env, slf)
                    .replace(/\}/g, "&#125;")
                    .replace(/\{/g, "&#123;")
                    .replace(/class/g, "className")
                    .replace(/\/\//g, "&#47;&#47;")
                    .replace(/\/\*/g, "&#47;&#42;")
                    .replace(/\*\//g, "$1&#42;&#47;")
                    .replace(/'/g, "&quot;")
                    .replace(/\n/g, "<br />");
            };
            /** 解析html属性 */
            parse_1.markdownIt.renderer.renderAttrs = function renderAttrs(token) {
                var i, l, result;
                if (!token.attrs) {
                    return "";
                }
                result = "";
                for (i = 0, l = token.attrs.length; i < l; i++) {
                    var key = token.attrs[i][0];
                    var value = token.attrs[i][1];
                    if (key === "style") {
                        /** JSX style对象 */
                        value = JSON.stringify((0, util_1.transformStyle)((0, util_1.escapeHtml)(value)));
                        result += " " + (0, util_1.escapeHtml)(key) + "=" + "{".concat(value, "}");
                        continue;
                    }
                    if (key === "class") {
                        key = "className";
                    }
                    result +=
                        " " +
                            (0, util_1.transformJSXAttr)((0, util_1.escapeHtml)(key), (0, util_1.escapeHtml)(value));
                }
                return result;
            };
            var tocOptions_1 = this.config.toc;
            parse_1.markdownIt.renderer.rules.tocOpen = function (tokens, idx /* , options, env, renderer */) {
                var _options = __assign({}, tocOptions_1);
                if (tokens && idx >= 0) {
                    var token = tokens[idx];
                    _options = Object.assign(_options, token.inlineOptions);
                }
                var id = _options.containerId
                    ? " id=\"".concat((0, util_1.escapeHtml)(_options.containerId), "\"")
                    : "";
                var containerHeaderHtml = _options.containerHeaderHtml || "";
                return "<nav".concat(id, " className=\"").concat((0, util_1.escapeHtml)(_options.containerClass), "\">").concat(containerHeaderHtml);
            };
            parse_1.markdownIt.renderer.rules.tocClose = function () {
                var containerFooterHtml = tocOptions_1.containerFooterHtml || "";
                return "".concat(containerFooterHtml, "</nav>");
            };
            // console.log(markdownIt.renderer.rules);
            // console.log(markdownIt.renderer.rules.tocClose.toString());
        }
    };
    return MarkdownTo;
}());
exports.MarkdownTo = MarkdownTo;
