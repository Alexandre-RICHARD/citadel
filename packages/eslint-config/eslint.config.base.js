import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";
import { importX } from "eslint-plugin-import-x";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import pluginPromise from "eslint-plugin-promise";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
	globalIgnores([
		"node_modules/**",
		"build/**",
		"report/**",
		"src/todo_folder/**",
	]),

	// TypeScript (Strict + Stylistique)
	...tseslint.configs.recommendedTypeChecked,
	...tseslint.configs.stylisticTypeChecked,

	js.configs.recommended,
	importX.flatConfigs.recommended,
	pluginPromise.configs["flat/recommended"],

	// Main config
	{
		files: ["**/*.{js,jsx,ts,tsx,cjs,mjs}"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2021,
			},
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: {
			"simple-import-sort": simpleImportSort,
			vitest,
		},
		settings: {
			"import-x/resolver": {
				typescript: true,
				node: true,
			},
		},
		rules: {
			// JS rules
			"no-alert": "error",
			"no-console": ["warn", { allow: ["error"] }],
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

			// Typescript
			"@typescript-eslint/consistent-indexed-object-style": "off",
			"@typescript-eslint/consistent-type-imports": [
				"error",
				{
					prefer: "type-imports",
					fixStyle: "inline-type-imports",
				},
			],
			"@typescript-eslint/consistent-type-exports": [
				"error",
				{
					fixMixedExportsWithInlineTypeSpecifier: true,
				},
			],
			"@typescript-eslint/consistent-type-definitions": ["error", "type"],
			"no-use-before-define": "off",
			"@typescript-eslint/no-use-before-define": [
				"error",
				{
					functions: true,
					classes: true,
					variables: true,
					allowNamedExports: true,
					enums: true,
					typedefs: true,
					ignoreTypeReferences: true,
				},
			],
			"promise/catch-or-return": ["error", { allowFinally: true }],

			// Imports
			"import-x/no-unresolved": "off",
			"import-x/no-extraneous-dependencies": "error",
			"import-x/no-default-export": "error",
			"import-x/first": "error",
			"import-x/no-dynamic-require": "warn",
			"import-x/no-nodejs-modules": "warn",
			"simple-import-sort/imports": "error",
			"simple-import-sort/exports": "error",
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: ["**/alex-specs/**"],
							message: "Should import only from @specs",
						},
					],
				},
			],
			"import-x/no-restricted-paths": [
				"error",
				{
					zones: [
						{
							from: "./src/todo_folder",
							target: "**/*",
							message:
								"Interdiction d'importer quoi que ce soit se trouvant dans la réserve",
						},
					],
				},
			],
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": "error",
			"@typescript-eslint/lines-between-class-members": "off",
			"@typescript-eslint/no-throw-literal": "off",

			// TEMPORARY
			"preserve-caught-error": ["off", {}],
		},
	},

	// Override
	// Désactive le type-checking pour les fichiers JS/MJS/CJS de configuration
	{
		files: ["**/*.{js,mjs,cjs}"],
		...tseslint.configs.disableTypeChecked,
	},
	{
		files: ["vite.config.ts", "vitest.config.ts"],
		rules: {
			"import-x/no-default-export": "off",
		},
	},
	{
		files: ["eslint.config.**js"],
		rules: {
			"import-x/no-default-export": "off",
		},
	},
	// Configuration isolée pour VITEST
	{
		files: [
			"__tests__/**/*",
			"**/*.mock.ts",
			"**/*.mock.tsx",
			"**/*.test.ts",
			"**/*.test.tsx",
			"vitest*",
		],
		plugins: {
			vitest,
		},
		rules: {
			...vitest.configs.recommended.rules,
			"@typescript-eslint/no-empty-function": "off",
			"promise/always-return": "off",
			"promise/catch-or-return": "off",
		},
	},

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
					singleAttributePerLine: true,
				},
			],
		},
	},
]);
