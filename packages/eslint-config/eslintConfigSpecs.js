import baseConfig from "./eslintConfigBase.js";

export default [
	...baseConfig,

	// Main rules
	//
	// Override
	{
		files: ["src/projects/**/*endpoint.ts"],
		rules: {
			"@typescript-eslint/consistent-type-definitions": ["error", "interface"],
		},
	},
];
