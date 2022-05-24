"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const path_1 = require("path");
const child_process_1 = require("child_process");
const util_1 = require("util");
const console_1 = require("console");
const config = {
    type: "a",
};
const execCmd = (0, util_1.promisify)(child_process_1.exec);
const mapPath = (0, path_1.resolve)("./map.json");
async function check() {
    try {
        await (0, promises_1.access)(mapPath);
    }
    catch (__) {
        console.log("map.json不存在，执行npm run start创建");
        (0, console_1.time)("npm run start");
        await execCmd("npm run start");
        (0, console_1.timeEnd)("npm run start");
    }
}
async function generateMenu(mds) {
    // console.log(mds);
}
async function start() {
    await check();
    const mdString = await (0, promises_1.readFile)(mapPath, { encoding: "utf-8" });
    const mds = JSON.parse(mdString);
    generateMenu(mds);
}
start();
