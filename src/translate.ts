import translateFn from "@vitalets/google-translate-api";
export function translate(q: string): Promise<string | void> | string {
	if (!q) {
		return "";
	}
	return translateFn(q, { to: "en" })
		.then((res) => {
			console.log(q + "  =>  " + res.text);
			return res.text;
		})
		.catch((err) => {
			console.error(q, "\n", err);
		});
}
