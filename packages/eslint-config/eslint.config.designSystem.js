import storybook from "eslint-plugin-storybook";

import baseConfig from "./eslint.config.base.js";
import reactConfig from "./eslint.config.react.js";

export default [
	...baseConfig,
	...reactConfig,

	// Main rules
	...storybook.configs["flat/recommended"],

	// Override
	{
		files: ["**/*.stories.tsx", ".storybook/*.{ts,tsx}"],
		rules: {
			"import-x/no-default-export": "off",
			"react-refresh/only-export-components": "off",
		},
	},
	{
		// Le format Storybook impose un export par défaut (meta) et un export nommé par story
		files: ["**/*.stories.tsx"],
		rules: {
			"citadel/max-one-export": "off",
		},
	},
];
