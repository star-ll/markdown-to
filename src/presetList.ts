import { escapeHtml } from "./util";
import hljs from "highlight.js"; // https://highlightjs.org/

export function presetTemplate(content: string, type: string) {
	const presetList = {
		html: `<!DOCTYPE html>
            <html lang="zh">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>文章</title>
            </head>
            <body>
                ${content}
            </body>
            </html>`,
		vue: `<template>
            <div>${content}</div>
            </template>
            <script></script>
            <style></style>
            `,
		jsx: `export default function Article() {
                return <>${content}</>;
            }
            `,
		tsx: `export default function Article() {
            return <>${content}</>;
            }
            `,
	};

	return presetList[type];
}

export function presetHightLight(type: string) {
	if (["tsx", "jsx"].includes(type)) {
		return function (str, lang) {
			if (lang && hljs.getLanguage(lang)) {
				try {
					return (
						'<pre class="hljs"><code>' +
						hljs.highlight(str, {
							language: lang,
							ignoreIllegals: true,
						}).value +
						"</code></pre>"
					);
				} catch (err) {
					console.error("highlight error\n" + err);
				}
			}
			return (
				'<pre class="hljs"><code>' + escapeHtml(`str`) + "</code></pre>"
			); // use external default escaping
		};
	}
	return function (str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return (
					'<pre class="hljs"><code>' +
					hljs.highlight(str, {
						language: lang,
						ignoreIllegals: true,
					}).value +
					"</code></pre>"
				);
			} catch (__) {
				//
			}
		}

		return '<pre class="hljs"><code>' + escapeHtml(str) + "</code></pre>";
	};
}
