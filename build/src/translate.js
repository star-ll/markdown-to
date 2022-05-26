"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = void 0;
const google_translate_api_1 = __importDefault(require("@vitalets/google-translate-api"));
function translate(q) {
    if (!q) {
        return "";
    }
    return (0, google_translate_api_1.default)(q, { to: "en" })
        .then((res) => {
        console.log(q + "  =>  " + res.text);
        return res.text;
    })
        .catch((err) => {
        console.error(q, "\n", err);
    });
}
exports.translate = translate;
