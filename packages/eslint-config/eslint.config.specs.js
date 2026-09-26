import baseConfig from "./eslint.config.base.js";

export default [
	...baseConfig,

	// Main rules
	//
	// Override
	{
		files: ["src/projects/**/*.ts"],
		rules: {
			"@typescript-eslint/consistent-type-definitions": ["off"],
		},
	},
];
