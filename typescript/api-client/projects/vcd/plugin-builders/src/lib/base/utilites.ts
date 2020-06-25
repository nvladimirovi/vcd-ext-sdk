import * as fs from 'fs';
import * as path from 'path';

export function extractExternalRegExps(externalLibs: string[] = []) {
	return externalLibs.map((libStr) => new RegExp(libStr))
}
  
export function splitVendorsIntoChunks(module, basePath) {
	// get the name. E.g. node_modules/packageName/not/this/part.js
	// or node_modules/packageName
	let packageName: string = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

	if (packageName.startsWith("@")) {
		const name = /[\\/]node_modules[\\/](.*?)([\\/])(.*?)([\\/])|$/.exec(module.context)[0].split("/node_modules/")[1];
		packageName = name.substr(0, name.length - 1);
	}

	const packageJsonPath = path.join(basePath, "node_modules", packageName, "package.json");
	let packageJson;
	if (fs.existsSync(packageJsonPath)) {
		packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
	}

	if (packageJson) {
		let packageName = packageJson.name;
		if (packageName.includes("/")) {
			packageName = packageName.split("/").join(".");
		}

		return `${packageName}@${packageJson.version}`;
	} else {
		return packageName;
	}
}