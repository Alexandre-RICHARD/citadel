import playwright from "eslint-plugin-playwright";
import globals from "globals";

import baseConfig from "./eslintConfigBase.js";

export default [
	...baseConfig,

	// Le rapport et les traces de Playwright : des bundles JS générés, énormes
	{ ignores: ["report-e2e/**"] },

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
	// Les règles de Playwright, sur les tests seulement : attentes oubliées (await manquant), attentes fixes
	// (waitForTimeout), test.only oublié, test sans aucune vérification
	{
		...playwright.configs["flat/recommended"],
		files: ["src/tests/**/*.spec.ts"],
	},
	// Un scénario ne tape jamais une adresse : il part de openSite, puis clique (liens, boutons), comme un utilisateur.
	// Les seules adresses ouvertes le sont par openSite et openMailLink (src/helpers/navigation)
	{
		files: ["src/tests/**/*.ts"],
		rules: {
			"no-restricted-properties": [
				"error",
				{
					property: "goto",
					message:
						"Pas de goto dans un scénario : pars de openSite(page), puis navigue en cliquant (ou openMailLink pour un lien d'email)",
				},
			],
		},
	},
	// Le faux Brevo tourne dans un conteneur : son journal est sa console
	{
		files: ["src/fake-brevo/**"],
		rules: {
			"no-console": "off",
		},
	},
	// playwright.config.ts doit exporter la configuration par défaut : c'est ainsi que Playwright la lit
	{
		files: ["playwright.config.ts"],
		rules: {
			"import-x/no-default-export": "off",
		},
	},
];
