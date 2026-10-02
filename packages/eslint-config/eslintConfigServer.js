import globals from "globals";

import baseConfig from "./eslintConfigBase.js";

export default [
	...baseConfig,

	// Main rules
	{
		files: ["**/*.{js,jsx,ts,tsx,cjs,mjs,mts,cts}"],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
	// Override
];
