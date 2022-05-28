export const chineseRegex = /[\u4e00-\u9fa5]/;

/** 转义html字符 */
// eslint-disable-next-line no-irregular-whitespace
const HTML_ESCAPE_TEST_RE = /[&<>"$\\]/;
// eslint-disable-next-line no-irregular-whitespace
const HTML_ESCAPE_REPLACE_RE = /[&<>"$\\]/g;
const HTML_REPLACEMENTS = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	// "{": "&#123",
	// "}": "&#125",
	$: "&#36",
	"\\": "\\\\",
};
function replaceUnsafeChar(ch) {
	return HTML_REPLACEMENTS[ch];
}
export function escapeHtml(str) {
	if (HTML_ESCAPE_TEST_RE.test(str)) {
		return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
	}
	return str;
}

/**  */
/**
 * @function 将style字符串转换成对象
 * @param style style字符串
 * @returns style对象
 */
export function transformStyle(style) {
	const temp: string[][] = style.split(";").map((item) => item.split(":"));
	const res = {};
	temp.forEach((sty) => {
		res[sty[0].toString()] = sty[1].toString().trim();
	});
	return res;
}
