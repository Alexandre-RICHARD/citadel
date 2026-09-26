import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import { reactRefresh } from "eslint-plugin-react-refresh";

import baseConfig from "./eslint.config.base.js";

export default [
	...baseConfig,

	reactRefresh.configs.vite(),

	// Main rules
	{
		files: ["**/*.{ts,tsx}"],
		plugins: {
			"react": reactPlugin,
			"react-hooks": reactHooksPlugin,
			"jsx-a11y": jsxA11yPlugin,
		},
		settings: {
			react: {
				version: "19",
			},
		},
		rules: {
			...reactPlugin.configs.recommended.rules,
			...reactPlugin.configs["jsx-runtime"].rules,
			...jsxA11yPlugin.configs.recommended.rules,
			...reactHooksPlugin.configs.recommended.rules,

			// React
			"react/no-danger": "error",
			"react/function-component-definition": "error",
			"react/no-array-index-key": "error",
			"react/jsx-key": ["error", { warnOnDuplicates: true }],
			"react/jsx-props-no-spreading": [
				"error",
				{
					exceptions: [],
				},
			],
		},
	},
	// Override
];
