"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformStyle = exports.escapeHtml = exports.chineseRegexAll = exports.chineseRegex = void 0;
exports.chineseRegex = /[\u4e00-\u9fa5]/;
exports.chineseRegexAll = /[\u4e00-\u9fa5]/g;
/** 转义html字符 */
// eslint-disable-next-line no-irregular-whitespace
const HTML_ESCAPE_TEST_RE = /[&<>"$]/;
// eslint-disable-next-line no-irregular-whitespace
const HTML_ESCAPE_REPLACE_RE = /[&<>"$]/g;
const HTML_REPLACEMENTS = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
    $: "&#36",
};
function replaceUnsafeChar(ch) {
    return HTML_REPLACEMENTS[ch];
}
function escapeHtml(str) {
    if (HTML_ESCAPE_TEST_RE.test(str)) {
        return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
    }
    return str;
}
exports.escapeHtml = escapeHtml;
/**  */
/**
 * @function 将style字符串转换成对象
 * @param style style字符串
 * @returns style对象
 */
function transformStyle(style) {
    const temp = style.split(";").map((item) => item.split(":"));
    const res = {};
    temp.forEach((sty) => {
        res[sty[0].toString().replace(/-(.)/g, (match, p1) => p1.toUpperCase())] = sty[1].toString().trim();
    });
    return res;
}
exports.transformStyle = transformStyle;
