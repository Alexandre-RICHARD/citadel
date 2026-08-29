/*
  Package nécessaire (les versions sont cohérentes entre elles)
    "@eslint/js": "^9.39.5",
    "@vitest/eslint-plugin": "^1.6.27",
    "eslint": "^9.39.5",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-prettier": "^5.5.6",
    "eslint-plugin-promise": "^7.3.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-simple-import-sort": "^14.0.0",
    "prettier": "^3.9.6",
    "typescript-eslint": "^8.68.0",

        "eslint-plugin-import": "^2.32.0", // TODO
            "eslint-plugin-react-refresh": "^0.4.20", // TODO
                "@tanstack/eslint-plugin-query": "^5.91.2", // TODO
*/

import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import globals from "globals";

import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import pluginPromise from "eslint-plugin-promise";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import vitest from "@vitest/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
	globalIgnores([
		"node_modules/**",
		"alex-specs/**",
		"src/reserve/**", // TODO
		"build/**",
		"report/**",
	]),

	// 2. TypeScript (Strict + Stylistique)
	...tseslint.configs.recommendedTypeChecked,
	...tseslint.configs.stylisticTypeChecked,

	// Désactive le type-checking pour les fichiers JS/MJS/CJS de configuration
	{
		files: ["**/*.{js,mjs,cjs}"],
		...tseslint.configs.disableTypeChecked,
	},

	pluginPromise.configs["flat/recommended"],

	// Plugins and rules
	{
		files: ["**/*.{js,jsx,ts,tsx}"],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2021,
			},
			parserOptions: {
				projectService: true,
				tsconfigRootDir: __dirname,
			},
		},
		plugins: {
			"react": reactPlugin,
			"react-hooks": reactHooksPlugin,
			"jsx-a11y": jsxA11yPlugin,
			"simple-import-sort": simpleImportSort,
			vitest,
		},
		settings: {
			react: {
				version: "detect",
			},
		},
		rules: {
			...reactPlugin.configs.recommended.rules,
			...reactPlugin.configs["jsx-runtime"].rules,
			...jsxA11yPlugin.configs.recommended.rules,
			...vitest.configs.recommended.rules,

			"no-alert": "warn",
			"no-console": "warn",
			// We allow to reassign acc in reduce
			"no-param-reassign": [
				"error",
				{
					props: true,
					ignorePropertyModificationsFor: ["acc"],
				},
			],
			"no-constant-condition": ["error", { checkLoops: "all" }],
			"no-await-in-loop": "error",
			"consistent-return": "error",
			"no-void": ["error", { allowAsStatement: true }],

			// React
			"react/no-danger": "error",
			"react/no-array-index-key": "error",
			"react/jsx-key": "off", // Todo : A changer, mais nécessite des changements assez importants sur certains composants
			// "react/jsx-key": ["error", { "warnOnDuplicates": true }],
			"react/jsx-props-no-spreading": "error",

			// --- TYPESCRIPT ---
			"@typescript-eslint/consistent-type-definitions": "off",
			"@typescript-eslint/consistent-indexed-object-style": "off",
			"@typescript-eslint/consistent-type-exports": "error",
			"@typescript-eslint/consistent-type-imports": [
				"error",
				{ prefer: "type-imports", fixStyle: "inline-type-imports" },
			],
			"promise/catch-or-return": ["error", { allowFinally: true }],

			// Imports
			"simple-import-sort/imports": "error",
			"simple-import-sort/exports": "error",
			"no-unused-vars": "off",
			"no-use-before-define": [
				"error",
				{
					functions: true,
					classes: true,
					variables: true,
					allowNamedExports: false,
					enums: true,
					typedefs: true,
					ignoreTypeReferences: true,
				},
			],
			"@typescript-eslint/no-unused-vars": "error",
		},
	},
	// Override

	// Prettier (doit être à la fin)
	eslintPluginPrettierRecommended,
	{
		rules: {
			"prettier/prettier": [
				"error",
				{
					trailingComma: "all",
					printWidth: 80,
					useTabs: true,
					tabWidth: 2,
					semi: true,
					singleQuote: false,
					jsxSingleQuote: false,
					bracketSpacing: true,
					bracketSameLine: false,
					endOfLine: "auto",
					quoteProps: "consistent",
					arrowParens: "always",
					endOfLine: "auto",
					singleAttributePerLine: true,
				},
			],
		},
	},
]);
