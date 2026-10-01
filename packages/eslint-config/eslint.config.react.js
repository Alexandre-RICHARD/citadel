import { importX } from "eslint-plugin-import-x";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import { reactRefresh } from "eslint-plugin-react-refresh";
import globals from "globals";

import baseConfig from "./eslint.config.base.js";

export default [
	...baseConfig,

	importX.flatConfigs.recommended,

	{
		settings: {
			react: {
				version: "19",
			},
		},
	},

	reactPlugin.configs.flat.recommended,
	reactPlugin.configs.flat["jsx-runtime"],
	jsxA11yPlugin.flatConfigs.recommended,
	reactHooksPlugin.configs.flat.recommended,
	reactRefresh.configs.vite(),

	// Main rules
	{
		files: ["**/*.{js,jsx,ts,tsx,cjs,mjs,mts,cts}"],
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				...globals.browser,
			},
		},
		rules: {
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

			"import-x/no-nodejs-modules": "warn",
		},
	},
	// Override
];
