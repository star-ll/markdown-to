import { Md } from "../type/index";
import { access, readFile } from "fs/promises";
import { join, resolve } from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { time, timeEnd } from "console";

const config = {
	type: "a",
};

const execCmd = promisify(exec);

const mapPath = resolve("./map.json");
async function check() {
	try {
		await access(mapPath);
	} catch (__) {
		console.log("map.json不存在，执行npm run start创建");
		time("npm run start");
		await execCmd("npm run start");
		timeEnd("npm run start");
	}
}

async function generateMenu(mds: any[]) {
	// console.log(mds);
}

async function start() {
	await check();
	const mdString: string = await readFile(mapPath, { encoding: "utf-8" });
	const mds: any[] = JSON.parse(mdString);
	generateMenu(mds);
}

start();
