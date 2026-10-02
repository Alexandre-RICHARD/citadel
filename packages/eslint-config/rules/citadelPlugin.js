import { componentFolderCase } from "./componentFolderCase.js";
import { fileNameCase } from "./fileNameCase.js";
import { maxOneExport } from "./maxOneExport.js";
import { scssModuleName } from "./scssModuleName.js";
import { testStructure } from "./testStructure.js";
import { tsxNameMatchesExport } from "./tsxNameMatchesExport.js";

export const citadelPlugin = {
	rules: {
		"component-folder-case": componentFolderCase,
		"file-name-case": fileNameCase,
		"max-one-export": maxOneExport,
		"scss-module-name": scssModuleName,
		"test-structure": testStructure,
		"tsx-name-matches-export": tsxNameMatchesExport,
	},
};
