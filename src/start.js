"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const mdTo = new index_1.default("/我的学习/my-knowledge-base", "./dist", {
    md: /\.md$/,
    ignores: [".git", "面试经历"],
    type: "tsx",
});
mdTo.render();
